const EDUCATION_URL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_URL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const getEducationData = () => d3.json(EDUCATION_URL);
const getCountyData = () => d3.json(COUNTY_URL);

getData();

async function getData() {
  try {
    const [educationData, countyData] = await Promise.all([
      getEducationData(),
      getCountyData(),
    ]);
    callback(educationData, countyData);
  } catch (err) {
    console.log(err);
  }
}

function callback(educationData, countyData) {
  console.log(educationData);
  console.log(countyData);
}
