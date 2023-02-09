let chart;
function updateGraph(data) {
    let label = 'Crime frequency';

    data = data || [
      { category: "Crime 1", count: Math.floor(Math.random() * 36) + 5 },
      { category: "Crime 2", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 3", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 4", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 5", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 6", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 7", count: Math.floor(Math.random() * 26) + 5 },
    ];
  
    if (chart) { chart.destroy() }
    chart = new Chart(
        document.getElementById('crime-graph'),
        {
            type: 'radar',
            data: {
                labels: data.map(row => row.category),
                datasets: [
                    {
                        label: label,
                        data: data.map(row => row.count)
                    }
                ]
            }
        });
  }

  function search(e) {
    e.preventDefault();
    alert(document.querySelector("#city-input").value)
  }

  updateGraph();

  document.querySelector("#nav").addEventListener("click", ()=>updateGraph());
  document.querySelector("#submit").addEventListener("click", search);

  var maths = 1 + 4;
  console.log(maths);

  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://jgentes-crime-data-v1.p.rapidapi.com/crime?startdate=9%2F19%2F2015&enddate=9%2F25%2F2015&long=-122.5076392&lat=37.757815",
    "method": "GET",
    "headers": {
        "X-RapidAPI-Key": "b6efa07087mshd599e08668966b6p19694fjsnd4d806b5dc09",
        "X-RapidAPI-Host": "jgentes-Crime-Data-v1.p.rapidapi.com"
    }
};

$.ajax(settings).done(function (response) {
    console.log(response);
});
