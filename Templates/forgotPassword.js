export const forgotPassword = (email, password, phone_no) => {
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
            style="margin: 0px; background-color: #ffffff"
            leftmargin="0"
          > 
          <p>Thanks for requesting Credentials. Here are the Your Credentials.</p>
          <br/>
          <br/>
          <p>Email: ${email}</p>
          <p>Password: ${password}</p>
          <p>Phone: ${phone_no}</p>
          <br/>
          <br/>
          <p>Spaces designed for connection. Designed for engagement. Designed for work.</p>
          <p>Email - sales@2gethr.co.in. Phone - 1800 309 3446. Address - Tower B,Mantri Commercio, Bellandur Bangalore</p>
          <br/>
          </body>
        </html>`);
}
