/**
 * Google Apps Script API Middleware for Astro CMS
 * 
 * Functions:
 * 1. Serves JSON API endpoints (GET & POST)
 * 2. Validates Firebase Bearer ID Tokens & Whitelist
 * 3. In-memory CacheService for ultra-fast response
 * 4. Read/Write to Private Google Sheets
 */

// CONFIGURATION: Whitelist user emails / UIDs yang diizinkan mengakses Admin
var AUTHORIZED_USERS = [
  "admin@pempekilen.com",
  "admin@example.com"
];

// Sheet Names
var SHEETS = {
  POSTS: "Posts",
  PAGES: "Pages",
  PRODUCTS: "Products",
  SETTINGS: "Settings"
};

/**
 * Handle GET Requests (Public / Admin data fetching with CacheService)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  var cache = CacheService.getScriptCache();
  
  // Serve from cache if available for read operations
  var cacheKey = "astro_cache_" + action + "_" + (e.parameter.slug || "all");
  var cachedData = cache.get(cacheKey);
  if (cachedData) {
    return jsonResponse(JSON.parse(cachedData));
  }

  try {
    var result = { success: true, data: null };

    if (action === "getPosts") {
      result.data = getRowsAsObjects(SHEETS.POSTS);
    } else if (action === "getPost") {
      var slug = e.parameter.slug;
      var posts = getRowsAsObjects(SHEETS.POSTS);
      result.data = posts.find(function(p) { return p.slug === slug; }) || null;
    } else if (action === "getPages") {
      result.data = getRowsAsObjects(SHEETS.PAGES);
    } else if (action === "getProducts") {
      result.data = getRowsAsObjects(SHEETS.PRODUCTS);
    } else if (action === "getSettings") {
      result.data = getSettingsObject();
    } else {
      return jsonResponse({ success: false, error: "Invalid action: " + action });
    }

    // Cache result for 15 minutes (900 seconds)
    cache.put(cacheKey, JSON.stringify(result), 900);
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle POST Requests (Mutations - Requires Auth)
 */
function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action;

    // Verify Authentication Token if action is protected
    var authHeader = e.headers && (e.headers.Authorization || e.headers.authorization);
    var token = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : payload.token;

    var authUser = verifyFirebaseToken(token);
    if (!authUser || !isUserAuthorized(authUser)) {
      return jsonResponse({ success: false, error: "403 Forbidden: User unauthorized or invalid token." });
    }

    var result = { success: true, message: "Action completed successfully" };

    if (action === "createPost") {
      createRow(SHEETS.POSTS, payload.post);
      clearCache();
    } else if (action === "updatePost") {
      updateRowById(SHEETS.POSTS, payload.id, payload.post);
      clearCache();
    } else if (action === "deletePost") {
      deleteRowById(SHEETS.POSTS, payload.id);
      clearCache();
    } else if (action === "updateSettings") {
      saveSettings(payload.settings);
      clearCache();
    } else {
      return jsonResponse({ success: false, error: "Unknown mutation action: " + action });
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Token Verification & Authorization
 */
function verifyFirebaseToken(token) {
  if (!token) return null;
  try {
    // Verifikasi via Google OAuth tokeninfo endpoint
    var response = UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + token, {
      muteHttpExceptions: true
    });
    if (response.getResponseCode() === 200) {
      return JSON.parse(response.getContentText());
    }
  } catch (e) {
    Logger.log("Token verification error: " + e);
  }
  return null;
}

function isUserAuthorized(authUser) {
  if (!authUser) return false;
  var email = authUser.email;
  var uid = authUser.user_id || authUser.sub;
  return AUTHORIZED_USERS.indexOf(email) !== -1 || AUTHORIZED_USERS.indexOf(uid) !== -1;
}

/**
 * Google Sheets Database Operations
 */
function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Initialize default headers
    if (sheetName === SHEETS.POSTS) {
      sheet.appendRow(["id", "title", "slug", "excerpt", "content", "image", "status", "category", "tags", "disable_ads", "published_at", "updated_at"]);
    } else if (sheetName === SHEETS.SETTINGS) {
      sheet.appendRow(["key", "value"]);
    }
  }
  return sheet;
}

function getRowsAsObjects(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (headers[j] === "tags" && typeof val === "string") {
        obj[headers[j]] = val ? val.split(",").map(function(t) { return t.trim(); }) : [];
      } else {
        obj[headers[j]] = val;
      }
    }
    rows.push(obj);
  }
  return rows;
}

function createRow(sheetName, item) {
  var sheet = getSheet(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!item.id) {
    item.id = Utilities.getUuid();
  }

  var newRow = headers.map(function(h) {
    var val = item[h];
    if (h === "tags" && Array.isArray(val)) {
      return val.join(", ");
    }
    return val !== undefined ? val : "";
  });

  sheet.appendRow(newRow);
  return item;
}

function updateRowById(sheetName, id, item) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIndex = headers.indexOf("id");

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] === id) {
      for (var key in item) {
        var colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          var val = item[key];
          if (key === "tags" && Array.isArray(val)) val = val.join(", ");
          sheet.getRange(i + 1, colIndex + 1).setValue(val);
        }
      }
      return true;
    }
  }
  return false;
}

function deleteRowById(sheetName, id) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var idIndex = data[0].indexOf("id");

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function getSettingsObject() {
  var sheet = getSheet(SHEETS.SETTINGS);
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      settings[data[i][0]] = data[i][1];
    }
  }
  return settings;
}

function saveSettings(settings) {
  var sheet = getSheet(SHEETS.SETTINGS);
  sheet.clearContents();
  sheet.appendRow(["key", "value"]);
  for (var key in settings) {
    sheet.appendRow([key, settings[key]]);
  }
}

function clearCache() {
  var cache = CacheService.getScriptCache();
  cache.remove("astro_cache_getPosts_all");
  cache.remove("astro_cache_getSettings_all");
  cache.remove("astro_cache_getPages_all");
  cache.remove("astro_cache_getProducts_all");
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
