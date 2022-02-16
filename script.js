const EDUCATION_URL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_URL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const getEducationData = () => d3.json(EDUCATION_URL);
const getCountyData = () => d3.json(COUNTY_URL);
const path = d3.geoPath();

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
  .attr('id', 'main-svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .call(tip);

const legend = svg
  .append('g')
  .attr('id', 'legend')
  .attr('transform', 'translate(20, 20)');

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

  const minEducation = d3.min(educationData, (d) => d.bachelorsOrHigher);
  const maxEducation = d3.max(educationData, (d) => d.bachelorsOrHigher);

  const RdBu = d3
    .scaleThreshold()
    .domain(
      d3.range(minEducation, maxEducation, (maxEducation - minEducation) / 8)
    )
    .range(d3.schemeRdBu[9]);

  const x = d3
    .scaleLinear()
    .domain([minEducation, maxEducation])
    .rangeRound([600, 860]);

  legend
    .selectAll('rect')
    .data(
      RdBu.range().map((d) => {
        extent = RdBu.invertExtent(d);
        if (extent[0] === null) {
          extent[0] = x.domain()[0];
        }
        if (extent[1] === null) {
          extent[1] = x.domain()[1];
        }
        return extent;
      })
    )
    .enter()
    .append('rect')
    .attr('height', 8)
    .attr('x', (d) => x(d[0]))
    .attr('width', (d) => (d[0] && d[1] ? x(d[1]) - x(d[0]) : null))
    .attr('fill', (d) => RdBu(d[0]));

  legend
    .call(
      d3
        .axisBottom(x)
        .tickSize(13)
        .tickFormat((d) => `${Math.round(d)}%`)
        .tickValues(RdBu.domain())
    )
    .select('.domain')
    .remove();

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
