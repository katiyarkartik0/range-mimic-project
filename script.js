const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        defaultViewport: null,
        args: ["--start-maximized"],
    });
    const page = await browser.newPage();
    await page.goto("https://groww.in/stocks/filter");

    let intermediateData = await page.evaluate(async function () {
        let Pages = document.querySelectorAll(".pg1231Box.fs15");
        let pageNo = parseInt(Pages[2].innerText);
        let sharePrice = [];
        let companyName = [];

        let index =  document.querySelectorAll(".pg1231Box.pg1231Enable");

        for (let i = 0; i < 25 ; i++) {
            let allPrice = document.querySelectorAll(".st16CurrVal");
            for (let j = 0; j < allPrice.length; j++) {
                sharePrice.push(
                    parseFloat(
                        allPrice[j].innerText
                            .replaceAll("₹", "")
                            .replaceAll(",", "")
                    )
                );
            }

            let allCompanyNames = document.querySelectorAll(".st16SymbolName");

            for (let j = 0; j < allCompanyNames.length; j++) {
                companyName.push(allCompanyNames[j].innerText);
            }

            index[1].click();
            await new Promise((res) => {
                setTimeout(res, 2500);
            });
        }

        return { companyName, sharePrice };
    });
    const { companyName, sharePrice } = intermediateData;
    const objArr = [];
    companyName.forEach((ele, idx) => {
        objArr.push({ share: ele, price: sharePrice[idx] });
    });
    objArr.sort((a, b) => { 
      return a.share - b.share;
    })
    let under500 = [];
    let under1000 = [];
    let under1500 = [];
    let under2000 = [];
    let above2000 = [];
    for(let i = 0; i<objArr.length; i++){
        if(objArr[i].price < 500){
            under500.push(objArr[i]);
        }
        else if(objArr[i].price < 1000){
            under1000.push(objArr[i]);
        }
        else if(objArr[i].price < 1500){
            under1500.push(objArr[i]);
        }
        else if(objArr[i].price < 2000){
            under2000.push(objArr[i]);
        }
        else if(objArr[i].price > 2000){
            above2000.push(objArr[i]);
        }
    }
    fs.writeFileSync('./underRs.500.json', JSON.stringify(under500,null,2));
    fs.writeFileSync('./underRs.1000.json', JSON.stringify(under1000,null,2));
    fs.writeFileSync('./underRs.1500.json', JSON.stringify(under1500,null,2));
    fs.writeFileSync('./underRs.2000.json', JSON.stringify(under2000,null,2));
    fs.writeFileSync('./overRs.2000.json', JSON.stringify(above2000,null,2));

     

})();