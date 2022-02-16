const EDUCATION_URL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_URL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const getEducationData = () => d3.json(EDUCATION_URL);
const getCountyData = () => d3.json(COUNTY_URL);

const WIDTH = 960;
const HEIGHT = 600;

const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .attr('id', 'tooltip')
  .html(function (d) {
    return d;
  })
  .offset([-10, 0]);

const svg = d3
  .select('#container')
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .call(tip);

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

  // const projection = d3.geoAlbers().translate([480, 300]).scale(1000);
  const projection = d3.geoAlbers();

  // const path = d3.geoPath().projection(projection);
  const path = d3.geoPath();

  const colorScale = d3
    .scaleThreshold()
    .domain(0, 100)
    .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#d7301f']);

  const color = d3
    .scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeGreens[9]);

  const minEducation = d3.min(educationData, (d) => d.bachelorsOrHigher);
  const maxEducation = d3.max(educationData, (d) => d.bachelorsOrHigher);

  const RdBu = d3
    .scaleThreshold()
    .domain(
      d3.range(minEducation, maxEducation, (maxEducation - minEducation) / 8)
    )
    .range(d3.schemeRdBu[9]);

  svg
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => {
      const county = educationData.filter((e) => e.fips === d.id)[0];
      if (county) return county.bachelorsOrHigher;
      console.log(`No data for ${d.id}`);
      return 0;
    })
    .attr('d', path)
    .attr('fill', (d) => {
      const county = educationData.filter((e) => e.fips === d.id)[0];
      if (county.bachelorsOrHigher) {
        return RdBu(county.bachelorsOrHigher);
      }
    })
    .on('mouseover', function (_event, d) {
      const county = educationData.filter((e) => e.fips === d.id)[0];
      const displayString = `<span class="county-name">${county.area_name}</span> - <span class="county-education">${county.bachelorsOrHigher}%</span>`;
      tip.attr('data-education', county.bachelorsOrHigher);
      tip.show(displayString, this);
    })
    .on('mouseout', () => tip.hide());

  svg
    .append('path')
    .datum(
      topojson.mesh(countyData, countyData.objects.states, (a, b) => a !== b)
    )
    .attr('class', 'states')
    .attr('d', path);
}
