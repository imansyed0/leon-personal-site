const fs = require('fs');

// Reference URLs in order
const referenceUrls = [
    "https://legalculturessubsoil.ilcs.sas.ac.uk/legal-actions/1998-2013-honduran-mining-laws/#:~:text=In%202013%2C%20the%20Honduran%20Government%20(led%20by,the%20above%20moratorium%20on%20new%20mining%20concessions.",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/legal-actions/2012-2013-creation-and-reconfiguration-of-montana-de-botaderos-national-park/",
    "https://pbicanada.org/2024/01/26/pbi-honduras-visits-communities-in-tocoa-as-the-los-pinares-asp-mining-concession-is-set-to-expire-on-january-28/",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2023/08/07-ASP-1-Y-2-eng-03.pdf#:~:text=submits%20requests%20for%20ASP1%20and%20ASP2%20non%2Dmetallic,MiAmbiente+%20grants%20environmental%20permit%20for%20ASP%20project.",
    "https://www.facebook.com/photo/?fbid=811035502617239&set=pb.100083594761446.-2207520000",
    "https://www.facebook.com/photo/?fbid=811065409280915&set=pb.100083594761446.-2207520000",
    "https://www.facebook.com/810956912625098/photos/pb.100083594761446.-2207520000/811064855947637/?type=3",
    "https://www.facebook.com/watch/?v=825384041182385",
    "https://www.facebook.com/810956912625098/photos/pb.100083594761446.-2207520000/828000254254097/?type=3",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf"
    // ... remaining URLs can be added here
];

function addReferencesToJson() {
    try {
        // Read the JSON file
        const jsonData = JSON.parse(fs.readFileSync('data/042b82da1eed052f6b645247e8f0be7b__export_events__deeprows.json', 'utf8'));
        
        // Add reference URLs to the first 10 items
        for (let i = 0; i < 10 && i < jsonData.length; i++) {
            if (jsonData[i] && referenceUrls[i]) {
                jsonData[i].reference_url = referenceUrls[i];
            }
        }
        
        // Write the updated JSON back to file
        fs.writeFileSync(
            'data/042b82da1eed052f6b645247e8f0be7b__export_events__deeprows.json',
            JSON.stringify(jsonData, null, 2),
            'utf8'
        );
        
        console.log('Successfully added reference URLs to the first 10 items');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the function
addReferencesToJson(); 