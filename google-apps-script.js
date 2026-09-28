/**
 * =========================================================================
 * Google Apps Script - Headless CMS Backend untuk AstroCMS
 * =========================================================================
 * 
 * PETUNJUK:
 * 1. JANGAN KLIK tombol "Run" / "Jalankan" di editor Apps Script!
 * 2. Klik tombol "Deploy" (kanan atas) -> "New deployment"
 * 3. Pilih tipe "Web app"
 * 4. Execute as: "Me"
 * 5. Who has access: "Anyone"
 * 6. Klik "Deploy" & salin URL Web App yang berakhiran /exec
 */

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  var output = { success: false, error: "Invalid request" };
  
  try {
    var params = {};
    var action = "";

    if (method === "GET") {
      params = (e && e.parameter) ? e.parameter : {};
      action = params.action || "";
    } else {
      if (e && e.postData && e.postData.contents) {
        var parsed = JSON.parse(e.postData.contents);
        action = parsed.action || "";
        params = parsed;
      }
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ====================== POSTS ======================
    if (action === "getPosts") {
      output = { success: true, data: getSheetData(ss, "posts") };
    } 
    else if (action === "createPost") {
      var post = params.post || {};
      post.id = post.id || "post-" + new Date().getTime();
      post.published_at = post.published_at || new Date().toISOString();
      post.updated_at = new Date().toISOString();
      appendRow(ss, "posts", post);
      output = { success: true, data: post };
    }
    else if (action === "updatePost") {
      var updated = updateRow(ss, "posts", params.id, params.post);
      output = { success: true, data: updated };
    }
    else if (action === "deletePost") {
      deleteRow(ss, "posts", params.id);
      output = { success: true, data: null };
    }

    // ====================== PRODUCTS ======================
    else if (action === "getProducts") {
      output = { success: true, data: getSheetData(ss, "products") };
    }
    else if (action === "createProduct") {
      var prod = params.product || {};
      prod.id = prod.id || "prod-" + new Date().getTime();
      prod.updated_at = new Date().toISOString();
      appendRow(ss, "products", prod);
      output = { success: true, data: prod };
    }
    else if (action === "updateProduct") {
      var updatedProd = updateRow(ss, "products", params.id, params.product);
      output = { success: true, data: updatedProd };
    }
    else if (action === "deleteProduct") {
      deleteRow(ss, "products", params.id);
      output = { success: true, data: null };
    }

    // ====================== PAGES ======================
    else if (action === "getPages") {
      output = { success: true, data: getSheetData(ss, "pages") };
    }
    else if (action === "createPage") {
      var page = params.page || {};
      page.id = page.id || "page-" + new Date().getTime();
      page.updated_at = new Date().toISOString();
      appendRow(ss, "pages", page);
      output = { success: true, data: page };
    }
    else if (action === "updatePage") {
      var updatedPage = updateRow(ss, "pages", params.id, params.page);
      output = { success: true, data: updatedPage };
    }
    else if (action === "deletePage") {
      deleteRow(ss, "pages", params.id);
      output = { success: true, data: null };
    }

    // ====================== SETTINGS ======================
    else if (action === "getSettings") {
      output = { success: true, data: getSettingsData(ss) };
    }
    else if (action === "updateSettings") {
      saveSettingsData(ss, params.settings || {});
      output = { success: true, data: params.settings };
    }
    else {
      output = { success: true, message: "AstroCMS API Google Apps Script is running!" };
    }

  } catch (err) {
    output = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------- Helper Functions -----------------

function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  if (sheet.getLastRowNum() < 2 || sheet.getLastColumn() < 1) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      if (headers[j] === "tags" && typeof val === "string" && val.startsWith("[")) {
        try { val = JSON.parse(val); } catch(e) {}
      }
      if (headers[j] === "disable_ads") {
        val = (val === true || val === "TRUE" || val === "true");
      }
      row[headers[j]] = val;
    }
    if (row.id) {
      rows.push(row);
    }
  }
  return rows;
}

function appendRow(ss, sheetName, item) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  if (sheet.getLastColumn() === 0 || sheet.getLastRowNum() === 0) {
    var initialHeaders = Object.keys(item);
    sheet.appendRow(initialHeaders);
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = item[key] !== undefined ? item[key] : "";
    if (Array.isArray(val)) val = JSON.stringify(val);
    newRow.push(val);
  }
  sheet.appendRow(newRow);
}

function updateRow(ss, sheetName, id, item) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastColumn() === 0) return item;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIndex = headers.indexOf("id");

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      for (var key in item) {
        var colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          var val = item[key];
          if (Array.isArray(val)) val = JSON.stringify(val);
          sheet.getRange(i + 1, colIndex + 1).setValue(val);
        }
      }
      sheet.getRange(i + 1, headers.indexOf("updated_at") + 1).setValue(new Date().toISOString());
      break;
    }
  }
  return item;
}

function deleteRow(ss, sheetName, id) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastColumn() === 0) return;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIndex = headers.indexOf("id");

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function getSettingsData(ss) {
  var sheet = ss.getSheetByName("settings");
  if (!sheet || sheet.getLastRowNum() < 1) return {};
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    var val = data[i][1];
    if (key) settings[key] = val;
  }
  return settings;
}

function saveSettingsData(ss, settings) {
  var sheet = ss.getSheetByName("settings");
  if (!sheet) {
    sheet = ss.insertSheet("settings");
  }
  sheet.clearContents();
  sheet.appendRow(["key", "value"]);
  for (var key in settings) {
    sheet.appendRow([key, settings[key]]);
  }
}
