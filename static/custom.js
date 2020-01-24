// Company charges accordian effect
$(document).on('click', '.entitled', function () {
    $(this).nextAll('.descriptions').first().slideToggle()
})

// Company Network Helper features following DOM change
$(document).on('mouseover', 'circle', function() {
    $('div[id*="-helper').css({left: '-27rem'})
    networkHelper('.hover-profile h6', '#glance-helper')
})

$(document).on('click', 'circle', function() {
    $('div[id*="-helper').css({left: '-27rem'})
    networkHelper($('[class^="tab-directors"] .tab-icons'), '#dir-tab-helper')
    networkHelper($('[class^="tab-finances"] .tab-icons'), '#finance-tab-helper')
    networkHelper($('[class^="tab-details"] .tab-icons'), '#info-tab-helper')
})

$(document).ready(function () {
    $('#customSwitch1').on('click', function() {
        if($('#customSwitch1').prop('checked')) {
            $('.custom-switch label').css('color', '#52ccb0')
        }
        else {
            $('.custom-switch label').css('color', '#9e9e9e')
            $('div[id*="-helper').css({left: '-27rem'})
        }
    })
    
    let targets = [
        '.total-co h6',
        '.total-dirs h6',
        '.hover-profile h6',
        'circle',
        '.map-title i'
    ]

    let helpers = [
        '#companies-helper',
        '#directors-helper',
        '#glance-helper',
        '#map-helper',
        '#dig-helper',
    ]

    x = 0
    while (x <= targets.length) {
        networkHelper(targets[x], helpers[x])
        x++
    }

    $('.search-error').hide()
    $('.loader-circle').hide()
    $('.search-window').hide()

    $('.search-error').fadeIn(3000)
    $('.search-error').fadeOut(5000)

    $('.carousel.carousel-slider').carousel({ fullWidth: true })

    $('.input-field button').on('click', function () {
        $('.search-window').css('visibility', 'hidden')
        $('.loader-circle').delay(500).fadeIn(1000)
        $('.loader-news').delay(2000).slideDown(4000)
        $('.latest-news').each(function(index) {
            $(this).delay(500*index).fadeIn()
        })
    })

    $('.search').on('click', function () {
        $('.header, footer').addClass('blur')
        $('.search, .carousel').hide()
        $('.search-window').fadeIn(1000)
    })

    $('.close-search').on('click', function () {
        $('.header, footer').removeClass('blur')
        $('.search-window').hide()
        $('.search, .carousel').fadeIn(999)
    })

    $('.investigating, .understanding, .sources').hide()

    toggleChapters('#investigating', '.investigating')
    toggleChapters('#understanding', '.understanding')
    toggleChapters('#sources', '.sources')

    $('.map-area p, .map-area .material-icons').on('click', function() {
        $('.grid-item-2').toggleClass('grid-item-2-exp')
        $('.map-area p').toggleClass('resize')
        $('.map-area .material-icons').toggleClass('rotate-icon')
    })

})



