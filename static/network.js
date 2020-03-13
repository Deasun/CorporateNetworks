function setNetwork() {

    let raw_data = $('div.data').text()
    let data = JSON.parse(raw_data)
    let count = 0

    networkName(data.nodes[0].name, '.header-title')
    createSidebar(data.nodes, '.hover-profile-col')
    
    addCompanyList(data.nodes, 'background-details')
    selectCompany()

    addOfficerList()
    selectOfficer(data.nodes, '.dir-list')    
   
    addIndustryList(data.nodes)
    selectIndustry(data.nodes, '.total-industries h6')
   
    $('.hover-profile h6').after(networkMapGlance(data.nodes))

    let svg = d3.select('#company-map'),
        width = +svg.attr('width'),
        height = +svg.attr('height')

    let simulation = d3.forceSimulation()
            .force('charge', d3.forceManyBody().strength(-1500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force('link', d3.forceLink().id(function (d) { return d._id; }).distance(200))
            .force('x', d3.forceX(width / 2))
            .force('y', d3.forceY(height / 2))
            .on('tick', ticked),
        link = svg.selectAll('.link'),
        node = svg.selectAll('.node')

    link = link
        .data(data.links)
        .enter().append('line')
        .style('stroke-linecap', 'round')
        .style('stroke', '#1c648a47') 
        .attr('stroke-width', 2)

    node = node
        .data(data.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .style('fill', function (node_d) {
            if (node_d.status == 'Active') {
                return '#0080c4'
            }
            else {return '#ffffffa3'}
        })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))

        // Node Hover Events
        .on('mouseover', function (d) { 
            
            $('.hover-profile').remove()

            // Create Company Profile for Sidebar
            $('.hover-profile-col').append(hoverProfile(d))

            // Highlight the connections
            link
                .style('visibility', function (link_d) {
                    return link_d.source._id === d._id || link_d.target._id === d._id ? 'visible' : 'hidden';
                }) // add dissolved colors
                .style('stroke', function (link_d) {
                    return link_d.source._id === d._id || link_d.target._id === d._id ? '#35864f7d' : 'hidden';
                }) // add dissolved colors
            
            // Hide Nodes Not Linked
            let x,
                linksArr = []
            for (x = 0; x < data.links.length; x++) {

                if (data.links[x].source._id === d._id|| data.links[x].target._id === d._id ) {
                    linksArr.push(data.links[x])
                }
            }

            let matchesArr = []
            for (x = 0; x < linksArr.length; x++) {
                    matchesArr.push(linksArr[x].source._id)
                    matchesArr.push(linksArr[x].target._id)
                }

            node
                .style('visibility', function (node_d) {
                    return matchesArr.includes(node_d._id) ? 'visible' : 'hidden';  
                })
        })

        .on('mouseout', function (d) {

            $('.hover-profile p, .hover-profile ul').remove()
            $('.hover-profile h6').after(networkMapGlance(data.nodes))

            node
                .style('visibility', 'visible')
                .style('fill', function (node_d) {
                    if (node_d.status == 'Active') {
                        return '#0080c4'
                    }
                    else {return '#ffffffa3'}
                })
        
            link
                .style('visibility', 'visible')
                .style('stroke', '#1c648a47')
        })

        // Node Click Events
        .on('click', function (d) {
            
            $('.placeholder').hide()

            count = count + 1

            // Create Company Card Profile
            $(cardProfile(d,count)).hide().appendTo('.grid-item-4').fadeIn(999)

            // Add Card Background Color
            profileColor('li[class^="tab-directors-' + count + '"]', '#646b2c', count)
            profileColor('li[class^="tab-finances-' + count + '"]', '#7d4636', count)
            profileColor('li[class^="tab-details-' + count + '"]', '#00304a', count)

            // Add Card Content
            addCardContent(d.officers, '.content-directors-' + count + ' .directors-' + count)
            addCardContent(d.former_officers, '.content-directors-' + count + ' .former-directors-' + count)
            addCardContent(d.industry, '.content-details-' + count + ' .details-' + count)

            // Add Finances
            addFinances(d.assets_2015, d.assets_2016, '.assets')
            addFinances(d.cash_2015, d.cash_2016, '.cash')
            addFinances(d.liabilities_2015, d.liabilities_2016, '.liabilities')

            addCharges(d.charges, '.charges')

            // Set Default View
            $('.content-details-' + count).hide()
            $('.content-finances-' + count).hide()
            $('.content-directors-' + count).show()

            // Toggle Card Tab Content
            toggleTag('.tab-directors-', '.content-details-', '.content-finances-', '.content-directors-', count)
            toggleTag('.tab-details-', '.content-directors-', '.content-finances-', '.content-details-', count)
            toggleTag('.tab-finances-', '.content-details-', '.content-directors-', '.content-finances-', count)
            closeProfile()
        })
    
    // Append Circle To Node
    circle = node.append('circle')
        // Set Node Diameter
        .attr('r', (function (d) {
            if (d.assets_2016 <= 0) { return 10 }
            else if (d.assets_2016 > 0 && d.assets_2016 < 100000) { return 10 }
            else if (d.assets_2016 >= 100000 && d.assets_2016 < 500000) { return 15 }
            else if (d.assets_2016 >= 500000 && d.assets_2016 < 1000000) { return 20 }
            else if (d.assets_2016 >= 1000000) { return 30 }
            else { return 10 }
        }))

    // Append Text To Node
    text = node.append("svg:text")
        .attr("class", "nodetext")
        .attr("dx", 4)
        .attr("dy", '10%')
        .text(function (d) { return d.name })

    // Simulate Network Graph
    simulation.nodes(data.nodes)
    simulation.force('link')
        .links(data.links);

    function ticked() {
        link.attr('x1', function (d) { return d.source.x; })
            .attr('y1', function (d) { return d.source.y; })
            .attr('x2', function (d) { return d.target.x; })
            .attr('y2', function (d) { return d.target.y; })

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    }

    // Enable Node Dragging
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x
        d.fy = d.y
    }

    function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null
        d.fy = null
    }

}