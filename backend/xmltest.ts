
import xml2js from 'xml2js';

const parser = new xml2js.Parser();

const xml = '<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas">\n<cas:authenticationSuccess>\n<cas:user>wasys</cas:user>\n<cas:attributes>\n<cas:azureObjectId>5655751f-c447-40fe-8e49-2ba38b0adaeb</cas:azureObjectId>\n<cas:mail>Wannes.Sys@UGent.be</cas:mail>\n<cas:givenname>Wannes</cas:givenname>\n<cas:surname>Sys</cas:surname>\n<cas:uid>wasys</cas:uid>\n<cas:ugentID>000200933476</cas:ugentID>\n<cas:objectClass>ugentAzureAccount</cas:objectClass>\n<cas:objectClass>ugentDictUser</cas:objectClass>\n<cas:objectClass>ugentPerson</cas:objectClass>\n<cas:objectClass>ugentStudent</cas:objectClass>\n<cas:lastenrolled>2024 - 2025</cas:lastenrolled>\n<cas:ugentStudentID>02009334</cas:ugentStudentID>\n</cas:attributes>\n</cas:authenticationSuccess>\n</cas:serviceResponse>'

parser.parseStringPromise(xml).then(
    (result) => {
        console.log(JSON.stringify(result, null, 2));
    },
    (err) => {
        console.error("Error parsing XML:", err);
    }
)