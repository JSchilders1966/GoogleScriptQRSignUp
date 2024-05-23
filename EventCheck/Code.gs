
var SHEETID = '1df-iNDi_TAtImsCRx9eOJ5lz6ptomf1hcwgnN7VJOBE';
var SHEETNAME="QRCODESCAN";
var header=[];

const doGet = (e) => {
  var hash = e.parameter.hash
  var json=finduser(hash);
  return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
};

function finduser(hash){
  var result = "ERROR";
  var ss=SpreadsheetApp.openById(SHEETID).getSheetByName(SHEETNAME);
  var data = ss.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
      if (MD5(data[i][1]) == hash){
        var naam = data[i][0];
        if (data[i][4] != 'gescand'){
          ss.getRange(i+1,5).setValue('gescand');
          result='NEW';
        } else {
         result='OLD'; 
        }   
      }
  }
  json = {status:result, name:naam};
  return json; 
}

function MD5 (input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input);
  var txtHash = '';
  for (i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
