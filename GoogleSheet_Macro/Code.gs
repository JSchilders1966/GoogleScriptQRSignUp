var SHEETID = "1df-iNDi_TAtImsCRx9eOJ5lz6ptomf1hcwgnN7VJOBE";
var SHEETNAME="aanmeldingen";
var QRTEMPLATEID = "1Kz0yIznCUtb0GTY5Sz8U1H1kiuV4SLPym-8EVlajMrE";
var TEMPLATEID = "1UzICJ5x0f58ZoC6vZnnYPLiUACrFyNF0QOG6BOQaNFE";
var OUTPUTFOLDERID="1aqBmlyHFlvhmc6McDbt8erx9NhMJ2LCe";

var VERSTUUR = true; 

var  mailonderwerp= "Toegangsbewijs Reünie Zeven Linden College"; 
var header=[];

function onOpen(){
  var ui = SpreadsheetApp.getUi()
      .createMenu('Aanmeldingen')
      .addItem('Verstuur mail', 'verstuurtickets')
      .addToUi();
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


function verstuurtickets(){
 
  var ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data = ss.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {

      if (data[i][3] != 'verstuurd'){
        var kandidaat =
        {
          naam:data[i][0],   
          email:data[i][1],        
          hash:MD5(data[i][1]),
          type:ss.getSheetName()
        }  
        
        createTicket(kandidaat)

        sendmail_(kandidaat);

        ss.getRange(i+1,4).setValue('verstuurd');
      }
      
  }  

}


function test(){
      
      var kandidaat =
        {
          naam:'Jeff Schilders',   
          email:'j.schilders@zeven-linden.nl',        
          hash:MD5('j.schilders@zeven-linden.nl'),
          type:'OudMedewerkers'
        } 
        createTicket(kandidaat);
        sendmail_(kandidaat);
}      


function createTicket(kandidaat) {
  var folder = DriveApp.getFolderById(OUTPUTFOLDERID);
  // Retrieve an image from the web.

  var PDF_FILE_NAME = kandidaat.hash+".pdf";

  // Create a document.
  if(kandidaat.type == 'Aanmeldingen'){
     var templ = QRTEMPLATEID;
     var resp = UrlFetchApp.fetch("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+kandidaat.hash);
     var image = resp.getBlob();
  } else {
     var templ = TEMPLATEID;
  }
  var copyFile = DriveApp.getFileById(templ).makeCopy(),
      copyId = copyFile.getId(),
      copyDoc = DocumentApp.openById(copyId),
      copyBody = copyDoc.getActiveSection(); 

  copyBody.replaceText('%naam%', kandidaat.naam);

  if(kandidaat.type == 'Aanmeldingen'){
     var oImg = copyBody.findText("%qrcode%").getElement().getParent().asParagraph();
       oImg.clear();
       oImg = oImg.appendInlineImage(image);
       oImg.setWidth(150);
       oImg.setHeight(150);
  }

  copyDoc.saveAndClose();

  if (PDF_FILE_NAME !== '') {
      var newFile = DriveApp.createFile(copyFile.getAs('application/pdf'));
      newFile.setName(PDF_FILE_NAME);
      newFile.moveTo(folder);
  } 
  copyFile.setTrashed(true)

}



function sendmail_(kandidaat) {
  var ticket =  DriveApp.getFilesByName(kandidaat.hash+'.pdf');

  var templ = HtmlService
      .createTemplateFromFile('mailtemplate');
  templ.kandidaat = kandidaat;

  var message = templ.evaluate().getContent();
  if (!VERSTUUR){
    console.log(Session.getActiveUser().getEmail());
    kandidaat.email = Session.getActiveUser().getEmail();
  }

  MailApp.sendEmail({
    to: kandidaat.email,
    subject: mailonderwerp,
    htmlBody: message,
    attachments: [ticket.next().getAs(MimeType.PDF)],
    name: mailonderwerp
  });
  Logger.log('Send to:'+kandidaat.email)
  
}

