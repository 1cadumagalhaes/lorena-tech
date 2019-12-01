exports.getData = async (req, res) => {
    try {
        let params = req.query;
        let querySQL = composeQuery(params);
        let rows = await main(querySQL);
        res.status(200).send(rows);
    } catch (err) {
        res.status(500).send(err);
        console.error(err);
    }
 };
 async function main(querySQL){
     let rows = await getDataFromBigQuery(querySQL);
     return rows
 }
 
 
 function composeQuery(params) {
     let parametros = [
         { param: 'preco', pos: 0, order: 'ASC' },
         { param: 'local', pos: 1, order: 'ASC' },
         { param: 'dormitorios', pos: 2, order: 'DESC' },
         { param: 'area', pos: 3, order: 'DESC' },
         { param: 'garagem', pos: 4, order: 'DESC' },
         { param: 'tipo', pos: 6, order: 'DESC' }
     ]
     
     let { longitude, latitude, precomaximo,  } = params;
     let head = params.priority;
     if (head) {
         head = stringToArray(head);
         parametros = orderParams(parametros, head);
     }
     let tipoConsulta = params.consulta?params.consulta:false
     let garages = params.garages? params.garages: false, area = params.area? params.area: false, tipo = params.tipo? params.tipo: false, quartos = params.quartos ? params.quartos : 1;
 
     let query = `WITH D AS 
                     (   WITH geo AS (
                             SELECT 
                                 *,
                                 ST_GEOGPOINT(CAST(longitude AS FLOAT64), CAST(latitude AS FLOAT64)) as loc_ape,
                                 ST_GEOGPOINT(${longitude},${latitude}) as loc_escolhida
                             FROM
                                 \`loftechbase123i.view_baseloft\`
                         )
                         SELECT
                             city, state, address, tower_name, building_type, CAST(rooms AS INT64) as rooms, 
                             CAST(garages AS INT64) as garages, CAST(useful_area AS INT64) as useful_area, 
                             CAST(point_estimate AS FLOAT64) as point_estimate, CAST(minimum_estimate AS FLOAT64) as minimum_estimate, 
                             CAST(maximum_estimate AS FLOAT64) as maximum_estimate,ST_DISTANCE(loc_escolhida,loc_ape) as distance
                         FROM geo
                     )
                     SELECT
                         * 
                     FROM
                         D
                     WHERE
                         distance <= 1000  
                         AND rooms>=${quartos}
                         ${precomaximo?"AND (minimum_estimate<="+precomaximo+" AND minimum_estimate+"+precomaximo*0.1+"<="+precomaximo+')':''}
                         ${garages?"AND garages>="+garages:''}
                         ${area?"AND useful_area>="+area:''}
                         ${tipo?"AND LOWER(building_type)='"+tipo+"'":''}
                     ORDER BY
                         ${paramsToString(parametros)}
                     LIMIT 10`;
                        
    if(tipoConsulta == "precominmax"){
        query = query.replace(/ORDER BY([\w\n\s="',]+)LIMIT([\s\d]+);?/g,'');
        let final = `SELECT MAX(minimum_estimate) as maximum_value, MIN(minimum_estimate) as minimum_value, COUNT(minimum_estimate) as number FROM getMinMax; `;
        query = `WITH getMinMax AS (${query}) ${final}`;

    }
     return query;
 }
 
 function orderParams(parametros, head) {
     return parametros.map(({ param, pos, order }) => {
         let newpos = head.indexOf(param) != -1 ? head.indexOf(param) : parametros.length;
         return { param, pos: newpos, order }
     }).sort((a, b) => {
         if (a.pos > b.pos)
             return 1;
         if (a.pos < b.pos)
             return -1;
         return 0;
     });
 }
 
 function paramsToString(parametros) {
     let de = ['preco', 'local', 'dormitorios', 'area', 'garagem', 'tipo'];
     let para = ['minimum_estimate', 'address', 'rooms', 'useful_area', 'garages', 'building_type'];
     return parametros.map(({ param, order }) => `${para[de.indexOf(param)]} ${order}`).join(', ');
 }
 
 function stringToArray(str) {
     return str.replace(/[\[\]\"]/g, "").split(',');
 }
 
 
 async function getDataFromBigQuery(sqlQuery, location = 'US') {
     const { BigQuery } = require('@google-cloud/bigquery');
     const bigQuery = new BigQuery();
     const options = {
         query: sqlQuery,
         // Location must match that of the dataset(s) referenced in the query.
         location: location,
     };
     // Run the query
     const [rows] = await bigQuery.query(options);
     return rows;
 }

 //?longitude=-46.6623264&latitude=-23.5537803&precomaximo=800000&priority=[quartos]&garages=1&area=50&tipo=apartamento&dormitorios=1
 