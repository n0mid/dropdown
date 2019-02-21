const fs = require('fs');

const additionalInfoList = require('../data/additionalInfo');
const firstnameList = require('../data/firstname');
const lastnameList = require('../data/lastname');

const result = [];

for (let i= 0; i < 10000; i++) {
   result.push(Object.assign({ avatar: 'https://randomuser.me/api/portraits/men/' + random(1, 99) + '.jpg'},

       firstnameList[random(0, firstnameList.length - 1)],
       lastnameList[random(0, lastnameList.length -1)],
       additionalInfoList[random(0, additionalInfoList.length -1)],
       { domain: `https://vk.com/${i}domain_name` })
   );

}

fs.writeFile("../data/data.json", JSON.stringify(result) , function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});



function random(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}