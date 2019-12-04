# Repositórios dos nossos microserviços

Aqui nós colocamos os códigos que desenvolvemos para apoiar nossa ideia.

Temos 3 partes principais, que foram implementadas como Cloud Functions no Google Cloud

- maps.js - `Para consumir a API do google e aceitar qualquer input de localização` 
  Para testar você pode acessar esse link, que nós desativaremos ao fim do dia: https://us-central1-lorena-tech.cloudfunctions.net/maps?local=**\<sua busca aqui\>** 
- query.js - `A parte responsável por extrair os dados da base`. Essa tem muitos mais parâmetros, mas se quiser testar, pode usar esse link: https://us-central1-lorena-tech.cloudfunctions.net/query?latitude=\<sua latitude>& longitude=\<sua longitude>"&dormitorios=<numero>&consulta=precominmax

