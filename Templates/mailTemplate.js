export const mailTemp = (qr_code) => {
  return (`<!DOCTYPE html>
        <html lang="en-US">
          <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>Credentials for Login</title>
            <meta name="description" content="" />
            <style type="text/css">
              a:hover {
                text-decoration: underline !important;
              }
            </style>
          </head>
        
          <body
            marginheight="0"
            topmargin="0"
            marginwidth="0"
            style="margin: 0px; background-color: #f2f3f8"
            leftmargin="0"
          > 
          <img src = ${qr_code} />
          <br/>
          <br/>
          <br/>
          
          </body>
        </html>`);
}
