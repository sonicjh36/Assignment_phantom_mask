
const fs = require('fs');
const dayInWeek = {
  "Mon" : 1,
  "Tue" : 2,
  "Wed" : 3,
  "Thu" : 4,
  "Fri" : 5,
  "Sat" : 6,
  "Sun" : 7,
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun"
}

const pharData = JSON.parse(fs.readFileSync('./data/pharmacies.json', 'utf8'));
const userData = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'))
const pharmacyInsert = pharData.map((phar)=>({name:phar.name, cashBalance:phar.cashBalance}));
const userInsert = userData.map((user) => ({name:user.name, cashBalance:user.cashBalance}))
const maskInsert =  async (knex, pharData) => {
  let data = [];
  let amount = 0;
  let rex = /\d+/g;
  // console.log(pharData.length);
  for(let i = 0; i < pharData.length; i++) {
    // console.log(pharData[i].name);
    let db = await knex('pharmacies').where('name', pharData[i].name).first()
    pharData[i].masks.forEach((mask) =>{
      amount = mask.name.match(rex);
      data.push({
        // pharName:pharData[i].name,
        name:mask.name,
        price:mask.price,
        amount:amount[0],
        pharmacy_id:db.id
      });
    })

  }
  return data;
};

const purchseInsert = async (knex, userData) => {
  let data = [];
  for(let i = 0 ; i < userData.length ; i++) {
    let userdb = await knex('users').where('name', userData[i].name).first()
    for(let j = 0; j < userData[i].purchaseHistories.length; j++) {
      // console.log(j, userData[i].purchaseHistories[j].pharmacyName)
      let phardb = await knex('pharmacies').where('name', userData[i].purchaseHistories[j].pharmacyName).first();
      // console.log(phardb)
      let maskdb = await knex('masks')
                        .where('name', userData[i].purchaseHistories[j].maskName)
                        .where('pharmacy_id', phardb.id)
                        .first();
      // console.log(maskdb)
      // console.log(userData[i].purchaseHistories[j].transactionDate.split(' ')[1])
      data.push({
        pharmacy_id:phardb.id,
        user_id:userdb.id,
        mask_id:maskdb.id,
        transaction_amount:userData[i].purchaseHistories[j].transactionAmount,
        transaction_date:userData[i].purchaseHistories[j].transactionDate.split(' ')[0],
        transaction_time:userData[i].purchaseHistories[j].transactionDate.split(' ')[1]
      })
    }
  }

  return data;
}

const openingInsert = async(knex, pharData) => {
  let data = [];
  for( let i = 0 ; i < pharData.length ; i++) {
    let phardb = await knex('pharmacies').where('name', pharData[i].name).first();
    let openTimeStr = pharData[i].openingHours.split(/[\s,\/]+/)
    let day = [];
    let range = false;
    let time = [];
    for(let j = 0 ; j < openTimeStr.length ; j++) {
      if(dayInWeek[openTimeStr[j]] != undefined) {
        if(range && dayInWeek[day[0]]-dayInWeek[openTimeStr[j]] > 1) {
          let rangeCount = dayInWeek[day[0]]-dayInWeek[openTimeStr[j]];
          if(rangeCount > 1 || rangeCount < 0) {
            // todo
          }
        }
        // console.log(openTimeStr[j])
        day.push(openTimeStr[j])
      }
      else if(openTimeStr[j] == '-') {
        if(time.length == 0)
          range = true;
      }
      else {
        // console.log(openTimeStr[j])
        time.push(openTimeStr[j]);
      }

      if(time.length == 2) {
        for(let k = 0; k < day.length; k++) {
          data.push({
            pharmacy_id:phardb.id,
            dayofweek:day[k],
            begin_time:time[0],
            end_time:time[1]
          })
          // console.log(data);
        }
        day = [];
        range = false;
        time = [];
      }
    }
  }

  return data;
}





exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('open_hours').del();
  await knex('purchase_histories').del();
  await knex('masks').del();
  await knex('pharmacies').del();
  await knex('users').del();

  await knex('pharmacies').insert(pharmacyInsert);
  await knex('users').insert(userInsert);

  let maskData  = await maskInsert(knex, pharData)
  await knex('masks').insert(maskData);

  let purData = await purchseInsert(knex, userData);
  await knex('purchase_histories').insert(purData);

  let openData =await openingInsert(knex, pharData);
  await knex('open_hours').insert(openData);
  //console.log(JSON.stringify(maskInsert(pharData),null,4));
};
