export const newsLetter = (name, email, phone, company) => {
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
          <p>Thanks for Signing Up. Here are the following Details.</p>
          <br/>
          <br/>
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Phone: ${phone}</p>
          <p>Company: ${company}</p>
          <br/>
          <br/>
          <p>Spaces designed for connection. Designed for engagement. Designed for work.</p>
          <p>Email - info@nexenstial.com. Phone - +91-7899874446. Address - SF223 Second Floor Nexenstial LLP,Marvel Artiza Building,opp to KIMS Road, Vidyanagar, Huballi, Karnataka</p>
          <br/>
          </body>
        </html>`);
}
