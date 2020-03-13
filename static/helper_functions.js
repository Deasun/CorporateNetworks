function loader() {

    if ($('.search-error p').is(':empty')) {

        $('.search-window').css('visibility', 'hidden')
        $('.loader-circle').show()
    }
}


function networkName(name, element) {

    return ($(element).after(
        '<div class="map-title">' +
            '<h6>Network Map for <span>' + name + '</span></h6>' +
        '</div>'))
}


function resetNodes(arr) {

    // Reset Nodes for industry
    $('h6').on('click', function() {
        
        let parentClass = $(this).parent().attr('class')

        if (parentClass === 'total-industries') {

            arr.forEach(function (index) {
    
                if (index.status === 'Active') {
                    $('text.nodetext').filter(function() {
                        if ($(this).text() === index.name) {
                            $(this).siblings().css('fill', '#0080c4')
                        }
                    })
                }
                else {
                    $('text.nodetext').filter(function() {
                        if ($(this).text() === index.name) {
                            $(this).siblings().css('fill', '#ffffffa3')
                        }
                    })
                }
            })
        }
        // Reset Nodes for Companies
        else if (parentClass === 'total-co') {
            $('.total-co h6').on('click', function() {
                $('text.nodetext').css('fill', '#bbd4b6b0').fadeIn(999)
                $('text.nodetext').css('font-size', '12px')
            })
        }

        // Reset Nodes for Officers
        else if (parentClass === 'total-offs') {
            $('.total-offs h6').on('click', function() {
                $('text.nodetext').siblings().animate({ 'stroke-width': '0px' }, 100)
            })
        }
    })
}


function resetMenuSelection(element, color, size) {

    $(element).css({
        'color': color,
        'background': 'None',
        'font-size': size,
        'padding-left': '0px'
    })
}


function createSidebar(arr, element) {

    directors = []
    arr.forEach(function (item) {
        directors.push(item.officers)
    })

    let totalDirs = directors.flat(Infinity)
    let result = {}

    totalDirs.forEach(function (v, i) {

        if (!result[v]) {
            result[v] = [i]
        }

        else {
            result[v].push(i)
        }
    })

    // Create an  array of objects counting occurences
    let resultArr = []
    Object.keys(result).forEach(function (v) {

        occurence = { "name": v, "number": result[v].length }
        resultArr.unshift(occurence)
    })

    // Sort objects in ascending order
    let orderArr = resultArr.sort((a, b) => (a.number > b.number ? -1 : 1))

    let officers = ''
    let i = 0

    while (i < orderArr.length) {

        let elem = '<p class="dir-list"><strong>' + orderArr[i].name + '</strong></p><p>' + orderArr[i].number + ' Appointments</p><br>';
        officers = officers + elem
        i++;
    }

    return $(element).before(
        '<div class="map-info">' +
            '<div class="total-co">' +
                '<h6>' + arr.length + ' Companies</h6>' +
                '<div>' + '</div>' +
            '</div>' +
            '<div class="total-offs">' +
                '<h6>' + orderArr.length + ' People</h6>' +
                '<div>' + officers + '</div>' +
            '</div>' +
            '<div class="total-industries">' +
                '<h6>' + ' Industries</h6>' +
                '<div>' + '</div>' +
        '</div>'
    )
}


function selectOfficer(arr, element) {

    $(element).on('click', function () {

        resetMenuSelection(element, '#ffe303', '12px')

        $(this).css({
            'color': '#fd4141',
            'background': '#000000a6',
            'padding-left': '5px'
        })
        $(this).animate({ 'font-size': '13px' }, 50)

        $('text.nodetext').siblings().animate({ 'stroke-width': '0px' }, 100)

        let dir = $(this).text()

        arr.forEach(function (index) {

            if (index.officers.includes(dir)) {

                $('text.nodetext').filter(function () {

                    if ($(this).text() === index.name) {
                        $(this).siblings()
                            .css('stroke', '#b63939b5')
                            .animate({ 'stroke-width': '10px' }, 100)
                    }
                })
            }
        })
    })
}


// Generate list of companies in each Network
function addCompanyList(arr, element) {

    resetNodes(arr)

    arr.forEach(function (index) {
        $('.total-co h6').next('div').append('<p>' + index.name + '</p>')
        $('.total-co h6').next('div').hide()
    })
    $('.total-co h6').on('click', function () {

        $(this).next('div').addClass(element)

        resetMenuSelection('.total-co p', '#f4f5fdde', '11px')

        $(this).next('div').slideToggle()

        $('text.nodetext').css('fill', '#bbd4b6b0').fadeIn(999)
        $('text.nodetext').css('font-size', '12px')
    })
}


// Network overview - default Glance
function networkMapGlance(arr) {

    name = arr[0].name
    active = 0
    nonActive = 0

    arr.forEach(function (index) {
        if (index.status == "Active") {
            active++
        }
        else {
            nonActive++
        }
    })

    let count =
        '<p>Network Map for ' + name + '</p>' +
        '<div class="glance-scroll co-count">' +
        '<p class="co-count">Active Companies</p>' +
            '<svg class="glance-node" height="80" width="80">' +
                '<circle cx="50" cy="35" r="30" fill="#0080c4" />' +
                '<text x="50" y="35" text-anchor="middle" fill="#000" stroke="#000" stroke-width="2px" dy=".3em">' + active + "</text>" +
            '</svg>' +
        '</div>' + 
        '<div class="glance-scroll">' +
        '<p class="co-count">Non-Active Companies</p>' +
            '<svg class="glance-node" height="80" width="80">' +
                '<circle cx="50" cy="35" r="30" fill="#ffffffa3" />' +
                '<text x="50" y="35" text-anchor="middle" fill="#000" stroke="#000" stroke-width="2px" dy=".3em">' + nonActive + "</text>" +
            '</svg>' +
        '</div>'


    return count
}


// Highlight companies by clicking on them
function selectCompany() {

    $('.total-co p').on('click', function () {
        
        $(this).css({
            'background': '#000000a6',
            'color': '#4BB639',
            'font-size': '13px',
            'padding-left': '5px'
        }).fadeIn(999)

        let hoverText = $(this).html()

        $('text.nodetext').filter(function () {
            if ($(this).html() === hoverText) {
                $(this).css('fill', '#4BB639').fadeIn(999)
                $(this).animate({ 'font-size': '14px' }, 100)
            }
        })
    })
}


// Create list of directors
function addOfficerList() {

    $('.total-offs h6').next('div').hide()
    $('.total-offs h6').on('click', function () {

        $(this).next('div').addClass('background-directors')
        $(this).next('div').slideToggle()

        // Reset Director Selection
        resetMenuSelection('.dir-list', '#ffe303', '12px')

        $('circle').css('stroke', 'none')
    })
}


// Create list of directors
function addIndustryList(arr) {

    // Delete duplicates from full list
    fullList = []

    arr.forEach(function (index) {

        index.industry.forEach(function (el) {
            if (el.includes('UK SIC')) {
                if (fullList.includes(el)) {}
                else {
                    fullList.push(el)
                }
            }
        })
    })

    sortedList = fullList.sort()

    // Prepend # of industries in list
    $('.total-industries h6').prepend(sortedList.length)

    sortedList.forEach(function (index) {
        $('.total-industries h6').next('div').append('<p>' + index + '</p><br>')
    })

}


// Highlight companies by industry
function selectIndustry(arr, target) {

    $(target).next('div').addClass('background-industries')
    $('.background-industries').hide()

    $(target).on('click', function() {

        $(target).next('div').slideToggle()
        // Reset industry list to default
        resetMenuSelection('.total-industries p', '#f4f5fdde', '12px')
        
    })

    $('.total-industries p').on('click', function () {
        
        arr.forEach(function (index) {
    
            if (index.status === 'Active') {
                $('text.nodetext').filter(function() {
                    if ($(this).text() === index.name) {
                        $(this).siblings().css('fill', '#0080c4')
                    }
                })
            }
            else {
                $('text.nodetext').filter(function() {
                    if ($(this).text() === index.name) {
                        $(this).siblings().css('fill', '#ffffffa3')
                    }
                })
            }
        })

        // Reset industry list to default
        resetMenuSelection('.total-industries p', '#f4f5fdde', '12px')
        
        $(this).css({
            'color': '#eab63c',
            'background': '#000000a6',
            'padding-left': '5px'
        })

        // Animate list selection
        $(this).animate({ 'font-size': '13px' }, 50)

        let industryName = $(this).text()

        arr.forEach(function (index) {

            // Highlight selected node
            if (index.industry.includes(industryName)) {
                $('text.nodetext').filter(function () {
                    if ($(this).text() === index.name) {
                        $(this).siblings()
                            .css('fill', '#eab63c')
                    }
                })
            }
        })
    })
}


// Generic function to add content in list format
function addCardContent(arr, element) {

    arr.forEach(function (item) {
        return $(element).last().after('<li style="font-weight:normal">' + item + '</li>')
    })
}


// Display the charges a company owes 
function addCharges(arr, element) {

    try {

        arr.forEach(function (item) {
            return ($(element).last().after(
                '<br><li class="entitled"><strong>' + item.persons_entitled + ' (' + item.created_on + ')</strong></li>' +
                '<li><em>' + item.type + ': ' + item.status.toUpperCase() + '</em></li>' +
                '<li class="descriptions">' + item.descriptions + '</li>'))
        })
    }

    catch (err) {
        return ($(element).last().after('<li><em>No charges listed.</em></li>'))
    }
}


// Add financial information to company cards
function addFinances(itemA, itemB, element) {
    if (isNaN(itemA)) {
        $(element).last().after(
            '<li>2016: ' + itemA + '</li>' +
            '<li>2015: ' + itemB + '</li>'
        )
    }

    else {
        $(element).last().after(
            '<li>2016: £' + itemA + '</li>' +
            '<li>2015: £' + itemB + '</li>'
        )
    }
}


// Toggle Company charges details
function toggleElements() {
    $('.entitled').on('click', function () {
        $(this).nextAll('.descriptions').first().slideToggle()
        // $(this).css('color', 'red')
    })
}


// Create company profile cards when nodes are clicked
function cardProfile(arr, count) {
    let card =
        '<div class="company-card">' +
            '<div class="side-tab card-head-' + count + '">' +
                '<ul name="tabs">' +
                    '<li class="tab-directors-' + count + '">' +
                        '<div class="tab-icons">' +
                            '<img src="/static/icons/directors.svg">' +
                        '</div></li>' +
                    '<li class="tab-finances-' + count + '">' +
                        '<div class="tab-icons">' +
                            '<img src="/static/icons/finances.svg">' +
                        '</div></li>' +
                    '<li class="tab-details-' + count + '">' +
                        '<div class="tab-icons">' +
                            '<img src="/static/icons/details.svg">' +
                        '</div></li>' +
                    '<li class="close">' +
                        '<div class="tab-icons">' +
                            '<i class="medium material-icons">cancel</i></div></li>' +
                '</ul>' +
            '</div>' +
            '<div name="counter" class="card-profile-' + count + '">' +
                '<div class="title"><a target="_blank" href="' + arr.url + '">' + arr.name + ' </a></div>' +
                '<div name="content" class="card-content-' + count + '">' +

                    // Directors
                    '<div class="content-directors-' + count + '">' +
                        '<div class="card-icons">' +
                            '<object type="image/svg+xml" data="/static/icons/directors.svg"></object>' +
                        '</div>' +
                        '<h3 class="header">Officers</h3>' + '<hr>' +

                        '<div class="director-list">' +
                            '<ul>' +
                                '<li class="header-list directors-' + count + '">Current</li>' +
                            '</ul>' +
                            '<ul>' +
                                '<li class="header-list former-directors-' + count + '">Former</li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>' +

                    // Details
                    '<div class="content-details-' + count + '">' +
                        '<div class="card-icons">' +
                            '<object type="image/svg+xml" data="/static/icons/details.svg"></object>' +
                        '</div>' +
                        '<h3 class="header">Details</h3>' + '<hr>' +
                        '<ul class="details-list">' +
                            '<li class="header-list">Status</li>' +
                            '<li>' + arr.status + '</li>' +
                            '<li class="header-list">Company Number</li>' +
                            '<li>' + arr._id + '</li>' +
                            '<li class="header-list">Address</li>' +
                            '<li><a target="_blank" href="https://maps.google.com/?q=' + arr.address + '">' + arr.address + '</a></li>' +
                            '<li class="header-list details-' + count + '">Industry Classification  ' +
                                '<a target="_link" href="https://onsdigital.github.io/dp-classification-tools/standard-industrial-classification/ONS_SIC_hierarchy_view.html">' +
                                '<i class="material-icons small">info_outline</i>' +
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +

                    // Finances
                    '<div class="content-finances-' + count + '">' +
                        '<div class="card-icons">' +
                            '<object type="image/svg+xml" data="/static/icons/finances.svg"></object>' +
                        '</div>' +
                        '<h3 class="header">' +
                            '<a target="_blank" href="https://opencorporates.com/companies/gb/' + arr._id + '#data-table-filing_delegate">Finances  </a>' +
                            '<a target="_link" href="https://corporatewatch.org/understanding-company-accounts/">' +
                                '<i class="material-icons small">info_outline</i>' +
                            '</a>' +
                        '</h3>' + '<hr>' +
                        '<div class="finances">' +
                            '<ul>' +
                                '<li class="header-list assets">Assets</li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="finances">' +
                            '<ul>' +
                                '<li class="header-list cash">Cash</li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="finances">' +
                            '<ul>' +
                                '<li class="header-list liabilities">Liabilities</li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="finances">' +
                            '<ul>' +
                                '<li class="header-list profit">Profit</li>' +
                            '</ul>' +
                        '</div>' +
                            '<ul>' +
                                '<li class="header-list charges">Charges</li>' +
                            '</ul>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'

    return card
}

// Create 'At A Glance' information when hovering over nodes
function hoverProfile(arr) {

    let no_active = '<span>' + arr.officers.length + '</span>'
    let assets = parseInt(arr.assets_2016)

    if (isNaN(arr.assets_2016)) { assets = '<span>N/A</span>' }
    else { assets = '<span>£' + arr.assets_2016 + ' </span>' }

    if (arr.charges === "No charges listed.") { charges = '<span>0</span>' }
    else { charges = '<span>' + arr.charges.length + '</span>' }

    if (arr.industry[0] === undefined) { industry = "No industry provided."}
    else { industry = arr.industry[0] }

    let profile =   '<div class="hover-profile">' +
                        '<h6>At a Glance...</h6>' +
                        '<p>' + arr.name + '</p>' +
                        '<p>' + arr.address + '</p>' +

                        '<ul>' +
                            '<li>' + no_active + ' Active Officers' + '</li>' +
                            '<li class="assets">' + assets + ' assets' + '</li>' +
                            '<li>' + charges + ' charges listed' + '</li>' +
                            '<br><li>' + industry + '</li>' +
                        '<ul>' +
                    '</div>'

    return profile

}

// Toggle between views on the company cards
function toggleTag(tabClick, contentHideOne, contentHideTwo, contentShow, count) {

    $(tabClick + count).on('click', function () {

        $(contentHideOne + count).hide()
        $(contentHideTwo + count).hide()
        $(contentShow + count).show()

        $('ul[name="tabs"] li').css('box-shadow', 'inset -2px -2px 3px black')
        $(this).css('box-shadow', 'none')
    })
}

// Style information on company profile differently
function profileColor(element, color, count) {

    $('.grid-item-4').on('click', element, function () {

        $('.card-profile-' + count).css('border', '5px solid ' + color)
        $('.card-profile-' + count + ' .title').css('background', color)
    })
}

function closeProfile() {
    $('.close').on('click', function () {
        $(this).closest('.company-card').fadeOut(499).remove()
        if ($('.company-card').length == 0) {
            $('.placeholder').fadeIn(999).css('display', 'block')
        }
    })
}

function toggleChapters(id, cls) {
    $(id).on('click', function () {
        $('.chapter-contents ul').slideUp()
        $('.chapter-titles h3').css('color', '#fff')
        $(id).css('color', '#f5d476')
        $(cls).slideToggle()
    })
}

function networkHelper(target, helper) {

    $(target).on('mouseover', function () {

        if ($('#customSwitch1').prop('checked')) {
            $('div[id*="-helper').css({ left: '-27rem' })
            $(target).css('cursor', 'help')
            $(helper).animate({ left: '-1.5rem' }, 250, "swing")
        }
        else {
            $(target).css('cursor', 'pointer')
            $(helper).css({ left: '-27rem' })
        }
        $(target).on('mouseout', function () {
            $(helper).css({ left: '-27rem' })
        })
    })
}