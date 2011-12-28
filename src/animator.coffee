#######################################
# PropertyForm
#######################################
class PropertyForm
    constructor: ->
        form = this
        @fields = $('#properties input').on 'change', ->
            $field = $(this)
            if $field.attr('id') == 'current-frame'
                @currentFrame = $field.val()
            else if form.box
                prop = $field.attr('id')
                form.box.set(prop, $field.val(), fromForm:true)
            else
                $field.val('')
        @fields.val('')
    
    box: null
    
    currentFrame: 0
        
    bind: (box) ->
        @unbind() if @box
        @box = box
        for prop, value of @box.properties[@currentFrame]
            $('#'+prop).val(value)
        @box.el().on('propChange', (e,prop,value) => $('#'+prop).val(value))
     
    unbind: ->
        @box.el().off('propChange')
        @box = null
        @fields.val('')


#######################################
# AnimBox
#  - an animatable box object
#######################################
class AnimBox
    constructor: (@id) ->
        @properties = {}
        @properties[AnimBox.currentFrame] = {}
        @properties[AnimBox.currentFrame]['id'] or= "box-" + AnimBox.nextId++
    
    @nextId: 0
    
    @currentFrame: 0
    
    @setCurrentFrame: (frame) ->
        @currentFrame = frame
        $('.anim-box').each ->
            $(this).data('object').loadFrame(@currentFrame)
    
    _formats = {
        normal: (s) -> s
        pixel: (s) -> "#{s}px"
    }
    
    @propTypes: {
        id: 
            access: 'attr'
            format: _formats.normal
        top:
            access: 'css'
            format: _formats.pixel
        left:
            access: 'css'
            format: _formats.pixel
        height:
            access: 'css'
            format: _formats.pixel
        width:
            access: 'css'
            format: _formats.pixel
    }
    
    el: ->
        @_el or= 
            $('<div id="'+@properties.id+'" class="anim-box" />').data('object', this)
                .draggable(drag: _onDrag)
                .resizable(resize: _onResize);
        
    set: (prop, value, update = {fromForm:true, fromCanvas:true}) ->
        (@properties[AnimBox.currentFrame] or= {})[prop] = value
        if update.fromForm
            if type = AnimBox.propTypes[prop]
                @el()[type.access](prop, type.format(value))
        
        if update.fromCanvas
            @el().trigger('propChange', [prop, value])
    
    get: (prop) ->
        @properties[AnimBox.currentFrame][prop] or=
            if type = AnimBox.propTypes[prop]
                @el()[type.access](prop)
            else null
    
    loadFrame: (frameToLoad) ->
        lowerFrames = {}
        for frame, props of @properties
            if frame <= frameToLoad
                lowerFrames.push(frame)
        
    
    #==============
    # Private
    #--------------
    _onDrag = (e,ui) ->
        box = ui.helper.data('object')
        box.set('top', ui.position.top, fromCanvas:true)
        box.set('left', ui.position.left, fromCanvas:true)
        
    _onResize = (e,ui) ->
        box = ui.helper.data('object')
        box.set('width', ui.size.width, fromCanvas:true)
        box.set('height', ui.size.height, fromCanvas:true)
        
#######################################
# Initialization
#######################################
$(->
    form = new PropertyForm()
    
    selectBox = ($el) ->
        $('.selected').removeClass('selected')
        $el.addClass('selected')
        form.bind($el.data('object'))
    
    $('#canvas').on('mousedown', '.anim-box', (e) ->
        e.stopPropagation()
        selectBox($(this))
    )
    
    $('#create-box').click(->
        box = new AnimBox();
        $('#canvas').append(box.el())
        selectBox(box.el())
    );
)
