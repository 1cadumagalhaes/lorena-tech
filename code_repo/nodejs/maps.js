const rp = require('request-promise');
const utf8 = require('utf8')


exports.getGeoLocation = async (req,res)=>{
    try {
        const place = req.query.local||false;
        if(place){
            let location = await placeToCoordinates(place);
            console.log(place);
            console.log(location)
            res.status(200).send(location)
        }
        else
            res.status(404).send("Você precisa informar o lugar")
    } catch (error) {
        console.error(error);
        throw error;
    }
};

async function placeToCoordinates(place){
    let input = utf8.encode(place), KEY = '<YOUR_API_KEY>';
    let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${input}&inputtype=textquery&fields=geometry&key=${KEY}`;

    let options = {
        uri: url,
        json: true
    };


    let response = await rp(options)
        .catch((err)=>console.error(err));
    let location = response.candidates[0].geometry.location;
    return location;
}
