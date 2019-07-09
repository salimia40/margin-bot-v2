let templates = {}

templates.opfRow = `
<tr>
                <th scope="row">INDEX</th>
                <td class="DEAL-STYLE">DEAL</td>
                <td>AMOUNT</td>
                <td>PRICE</td>
                <td>CODE</td>
              </tr>
`

templates.opfTemp = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <style>
        * {
            text-align: center;
            direction: rtl;
        }
    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-sm">logo here</div>
            <div class="col-sm">فاکتور های باز  NAME</div>
            <div class="col-sm"> تا تاریخ DATE</div>
        </div>
        <table class="table mt-5">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">خرید-فروش</th>
                <th scope="col">مقدار</th>
                <th scope="col">قیمت</th>
                <th scope="col">کد معامله</th>
              </tr>
            </thead>
            <tbody>
              ROWS
            </tbody>
          </table>
    </div>
</body>
</html>`

templates.mrRow = `<tr>
<th scope="row">INDEX</th>
<td class="DEAL-STYLE">DATE</td>
<td>PROFIT</td>
<td>SUM</td>
</tr>`

templates.mrTemp = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <style>
        * {
            text-align: center;
            direction: rtl;
        }

    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-sm">logo here</div>
            <div class="col-sm">گزارش وضعیت ماهانه  NAME</div>
        </div>
        <table class="table mt-5">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">تاریخ</th>
                <th scope="col">سود و زیان</th>
                <th scope="col">جمع</th>
              </tr>
            </thead>
            <tbody>
              ROWS
            </tbody>
          </table>
    </div>
</body>
</html>`


module.exports = templates