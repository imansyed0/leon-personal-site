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
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/legal-actions/2018-2022-criminalisation-and-detention-of-cmdbcp-environmental-rights-defenders/",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/legal-actions/2018-eviction-of-protest-encampment/",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/legal-actions/2018-2022-criminalisation-and-detention-of-cmdbcp-environmental-rights-defenders/",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/legal-actions/2019-constitutional-challenge-to-decree-modifying-montana-de-botaderos-national-park/",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://www.amnesty.org/es/wp-content/uploads/2021/05/AMR3729342020ENGLISH.pdf",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/wp-content/uploads/2024/02/English-UVA-Report-on-Guapinol_0.pdf",
    "https://www.frontlinedefenders.org/en/case/killing-defender-arnold-joaquin-morazan-erazo-who-had-been-criminalised-his-defense-river",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/legal-actions/2021-un-high-commissioner-for-human-rights-report-to-the-human-rights-council-on-honduras/",
    "https://legalculturessubsoil.ilcs.sas.ac.uk/legal-actions/2021-un-working-group-on-arbitrary-detention-issued-opinion-on-detained-cmdbcp-environmental-defenders/",
    "https://criterio.hn/presentan-informe-sobre-contaminacion-provocada-por-minera-en-el-rio-guapinol-en-tocoa-colon/",
    "https://protectdefenders.eu/honduras-trial-of-the-guapinol-defenders-and-harassment-against-their-families/",
    "https://www.amnesty.org/en/latest/news/2021/12/honduras-amnesty-international-urges-authorities-immediately-release-eight-prisoners-conscience/",
    "https://www.amnesty.org/en/latest/news/2022/02/honduras-amnesty-international-demands-justice-guapinol-eight/",
    "https://www.amnesty.org/en/latest/news/2022/02/honduras-amnesty-international-condemns-conviction-six-guapinol-eight/",
    "https://www.frontlinedefenders.org/en/statement-report/international-forum-calls-immediate-release-and-reparations-defenders-guapinol",
    "https://www.frontlinedefenders.org/en/case/legal-proceedings-reopened-against-five-environmental-defenders-guapinol-including-late-juan",
    "https://criterio.hn/recuerdan-a-serna-que-sigue-pendiente-informe-por-contaminacion-de-parque-nacional-carlos-escaleras/",
    "https://contracorriente.red/en/2024/01/25/victims-of-mining-conflict-expect-an-indictment-against-lenir-perez-in-view-of-a-possible-concession-extension/",
    "https://www.amnesty.org.uk/urgent-actions/two-water-defenders-killed",
    "https://www.amnesty.org/en/wp-content/uploads/2024/09/AMR3785532024ENGLISH.pdf",
    "https://www.facebook.com/photo/?fbid=168737129256112&set=pb.100083594761446.-2207520000",
    "https://contracorriente.red/en/2024/01/25/victims-of-mining-conflict-expect-an-indictment-against-lenir-perez-in-view-of-a-possible-concession-extension/",
    "https://apnews.com/world-news/general-news-dde152a40b7349ed915fbf583b31ad35",
    "https://contracorriente.red/en/2024/01/25/victims-of-mining-conflict-expect-an-indictment-against-lenir-perez-in-view-of-a-possible-concession-extension/",
    "https://im-defensoras.org/en/2024/02/whrd-alert-honduras-environmental-defenders-in-guapinol-and-bajo-aguan-at-high-risk/",
    "https://www.facebook.com/100083594761446/videos/394277129957487/",
    "https://civicus.org/index.php/media-resources/news/interviews/7181-honduras-we-demand-environmental-justice-in-the-face-of-corrupt-interests-insensitive-to-local-needs",
    "https://www.lawg.org/migration-news-brief-for-august-2nd-2024/",
    "https://devp.org/en/campaign/stand-for-the-land/",
    "https://www.elsaltodiario.com/honduras/sicarios-matan-balazos-al-ambientalista-juan-lopez-defensor-del-rio-guapinol",
    "https://www.frontlinedefenders.org/en/case/legal-proceedings-reopened-against-five-environmental-defenders-guapinol-including-late-juan",
    "https://www.business-humanrights.org/en/latest-news/honduras-tras-seis-a%C3%B1os-de-persecuci%C3%B3n-cinco-defensores-del-parque-nacional-carlos-escaleras-logran-su-libertad-definitiva/",
    "https://www.facebook.com/100083594761446/videos/1210803497276054",
    "https://www.facebook.com/photo?fbid=613387854791035&set=a.136301962499629",
    "https://www.guapinolresiste.org/post/guilty-otoniel-flores-mira-part-of-the-criminal-structure-behind-the-pinares-ecotek-megaproject",
    "https://www.guapinolresiste.org/post/evidence-confirms-criminal-responsibility-of-pinares-ecotek-mining-executives-in-the-destruction-of"
];

function addReferencesToJson() {
    try {
        // Read the JSON file
        const jsonData = JSON.parse(fs.readFileSync('data/042b82da1eed052f6b645247e8f0be7b__export_events__deeprows.json', 'utf8'));
        
        // Add reference URLs to all items except the last empty one
        for (let i = 0; i < jsonData.length - 1; i++) {
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
        
        console.log('Successfully added reference URLs to all items');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the function
addReferencesToJson(); 