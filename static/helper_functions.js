// Search Preloader
function loader() {

    if ($('.search-error p').is(':empty')) {

        $('.search-window').css('visibility', 'hidden')
        $('.loader-circle').show()
    }
}

// Display of the Core Company
function networkName(name, element) {

    return  ($(element).after(
        '<div class="map-title">' +
            '<h6>Network Map for <span>' + name + '</span></h6>' +
        '</div>'))
}

// Count Directorships by Director
function countDirectors(arr, element) {

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

        occurence = {"name": v, "number": result[v].length }
        resultArr.unshift(occurence)
    })

    // Sort objects in ascending order
    let orderArr = resultArr.sort((a, b) => (a.number > b.number ? -1 : 1 ))

    let topDirs = ''
    let i = 0

    while (i < orderArr.length) {

        let elem = '<p class="dir-list"><strong>' + orderArr[i].name + '</strong></p><p>' + orderArr[i].number + ' Directorships</p><br>';
        topDirs = topDirs + elem
        i++;
    } 

    return  $(element).before(
                '<div class="map-info">' +
                    '<div class="total-co">' +
                        '<h6>' + arr.length + ' Companies</h6>' +
                            '<div>' +
                            '</div>' +
                    '</div>' +
                    '<div class="total-dirs">' +
                        '<h6>' + orderArr.length + ' Directors</h6>' +
                        '<div>' +    
                            topDirs +
                        '</div>' +
                    '</div>' +
                    '</div>' +    
                '</div>'
            )
}

// Highlight nodes on hover
function highlightNode(arr, element) {
    $(element).on('click', function() {
        
        $(element).css({
            'color': '#f4f5fd8c',
            'background': 'None',
            'padding-left': '0px',
            'font-size': '11px'
        })
        
        $(this).css({
            'color': '#fd4141',
            'background': '#000000a6',
            'padding-left': '5px'
        })
        $(this).animate({'font-size': '13px'}, 50)

        $('text.nodetext').siblings().animate({'stroke-width': '0px'}, 100)
        
        let dir = $(this).text()

        arr.forEach(function(index) {

            if (index.officers.includes(dir)) {
                
                $('text.nodetext').filter(function() {

                    if ($(this).text() === index.name) {
                        $(this).siblings()
                            .css('stroke', '#b63939b5')
                            .animate({'stroke-width': '6px'}, 100)

                    }
                })
            }
        })
    })
}

// Generate list of companies in each Network
function addCompanyList(arr) {

    arr.forEach(function (index) {
        $('.total-co h6').next('div').append('<p>' + index.name + '</p>')
        $('.total-co h6').next('div').hide()
    })
        $('.total-co h6').on('click', function(){
            
            $(this).next('div').addClass('background-details')
            $('.total-co p').css({
                'color': '#f4f5fdde',
                'background': 'None',
                'font-size': '11px',
                'padding-left': '0px'
            }).fadeIn()
            $(this).next('div').slideToggle()
            $('text.nodetext').css('fill', '#bbd4b6b0').fadeIn(999)
            $('text.nodetext').css('font-size', '12px')
            // $('.total-co p').css('color', '#f4f5fdde').fadeIn(999)
    })

}

// Highlight companies by clicking on them
function selectCompany() {

    $('.total-co p').on('click', function() {
        $(this).css({
            'color': '#4BB639',
            'background': '#000000a6',
            'font-size': '13px',
            'padding-left': '5px'
        }).fadeIn(999)
        let hoverText = $(this).html()
        
        $('text.nodetext').filter(function() {
            if ($(this).html() === hoverText) {
                $(this).css('fill', '#4BB639').fadeIn(999)
                $(this).animate({'font-size': '14px'}, 100)
                
            }
        })
    })
}
	

// Create list of directors
function addDirsList() {

    $('.total-dirs h6').next('div').hide()
    $('.total-dirs h6').on('click', function() {
        
        $(this).next('div').addClass('background-directors')
        $(this).next('div').slideToggle()

        // Reset Director Selection
        $('.dir-list').css({
            'color': '#f4f5fdde',
            'background': 'None',
            'padding-left': '0px',
            'font-size': '11px'
        })
        $('circle').css('stroke', 'none')
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

        arr.forEach(function(item) {
            return ($(element).last().after(
                '<br><li class="entitled"><strong>' + item.persons_entitled + ' (' + item.created_on +  ')</strong></li>' +
                '<li><em>' + item.type + ': ' + item.status.toUpperCase() + '</em></li>' +
                '<li class="descriptions">' + item.descriptions + '</li>' ))
        })
    }

    catch(err) {
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
        $('.entitled').on('click', function() {
            $(this).nextAll('.descriptions').slideToggle()
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
                            '<h3 class="header">Directors</h3>' + '<hr>' +
                            
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

    let profile =   '<div class="hover-profile">' +
                        '<h6>At a Glance...</h6>' +
                       '<p>' + arr.name + '</p>' +
                        '<p>' + arr.address + '</p>' +

                        '<ul>' +
                            '<li>' + no_active + ' Active Directors' + '</li>' +
                            '<li class="assets">' + assets + ' assets' + '</li>' +
                            '<li>' + charges + ' charges listed' + '</li>' +
                            '<li>' + arr.industry[0] + '</li>' +
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

    $('.grid-item-4').on('click', element, function() {

        $('.card-profile-' + count).css('border', '5px solid ' + color)
        $('.card-profile-' + count + ' .title').css('background', color)
    })
}

function closeProfile() {
    $('.close').on('click', function() {
        $(this).closest('.company-card').fadeOut(499).remove()
        if ($('.company-card').length == 0) {
            $('.placeholder').fadeIn(999).css('display', 'block')
        }
    })
}

function toggleChapters(id, cls) {
    $(id).on('click', function() {
        $('.chapter-contents ul').slideUp()
        $('.chapter-titles h3').css('color', '#fff')
        $(id).css('color', '#f5d476')
        $(cls).slideToggle()
    })
}

function networkHelper(target, helper) {

    $(target).on('mouseover', function() {

        if ($('#customSwitch1').prop('checked')) {
            $('div[id*="-helper').css({left: '-27rem'})
            $(target).css('cursor', 'help')
            $(helper).animate({left: '-1.5rem'}, 250, "swing")
        }
        else {
            $(target).css('cursor', 'pointer')
            $(helper).css({left: '-27rem'})
        }
        $(target).on('mouseout', function() {
            $(helper).css({left: '-27rem'})
        })

    })
 
}











