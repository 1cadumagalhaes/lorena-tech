// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const rp = require('request-promise');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    let localizacao = request.body.queryResult.parameters.localizacao,dormitorios = request.body.queryResult.parameters.dormitorios, 
    garagem = request.body.queryResult.parameters.garagem;

  function getLocation(agent){
      localizacao = agent.parameters.localizacao,dormitorios = agent.parameters.dormitorios, garagem = agent.parameters.garagem;
        let coord = await rp({uri:`https://us-central1-lorena-tech.cloudfunctions.net/maps?local=${localizacao}`})
          .then(output=> res.json({ 'fulfillmentText': output }))
          .catch(err=>console.error(err));
        let {latitude, longitude } = coord;
        let lista = await rp(`https://us-central1-lorena-tech.cloudfunctions.net/query?longitude=${longitude}&latitude=${latitude}3&dormitorios=${dormitorios}&garagem=${garagem}&consulta=precominmax`)
        .then(output=> res.json({ 'fulfillmentText': output }))
        .catch(err=>console.error(err));;
        agent.add(JSON.stringify(lista,null,2));

  }
  
  let intentMap = new Map();
  intentMap.set('encontrar.ape - decidiu',getLocation);
  agent.handleRequest(intentMap);
});
