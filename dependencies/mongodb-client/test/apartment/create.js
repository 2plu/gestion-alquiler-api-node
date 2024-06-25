const MongoDB = require('../../index.js')
const mng = MongoDB

mng.mongo.connect()

const apartment = {
    name: 'Hostal La Marina',
    address: 'Avda. Libertad, 89',
    city: 'Oropesa del Mar',
    postalCode: '12594',
    country: 'España'
}

async function test(apartment) {
    const ap = await mng.models.apartment.createNewApartment({
        name: apartment.name,
        address: apartment.address,
        city: apartment.city,
        postalCode: apartment.postalCode,
        country: apartment.country
    })
    console.log("apartment: ", ap)
}

test(apartment)