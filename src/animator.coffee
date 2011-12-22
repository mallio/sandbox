#######################################
# PropertyForm
#######################################
class PropertyForm
    constructor: ->
        form = this
        @fields = $('#properties input').change ->
            $field = $(this)
            if form.box
                prop = $field.attr('id')
                form.box.set(prop, $field.val(), fromForm:true)
            else
                $field.val('')
        @fields.val('')
    
    box: null
        
    bind: (box) ->
        @unbind() if @box
        @box = box
        for prop, value of @box.properties
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
        @properties['id'] or= "box-" + AnimBox.nextId++
    
    @nextId: 0
    
    @htmlAttributes: ['id']
    
    @cssProperties: ['top', 'left', 'height', 'width']
    
    el: ->
        @_el or= 
            $('<div id="'+@id+'" class="anim-box" />').data('object', this)
                .draggable(drag: _onDrag)
                .resizable(resize: _onResize);
        
    set: (prop, value, update = {fromForm:true, fromCanvas:true}) ->
        @properties[prop] = value
        if update.fromForm
            if prop in AnimBox.htmlAttributes
                @el().attr(prop, value)
            else if prop in AnimBox.cssProperties
                @el().css(prop, value)
        
        if update.fromCanvas
            @el().trigger('propChange', [prop, value])
    
    get: (prop) ->
        @properties[prop] or=
            if prop in AnimBox.htmlAttributes
                @el().attr(prop)
            else if prop in AnimBox.cssProperties
                @el().css(prop) 
            else null
    
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
    $('#canvas').on('mousedown', '.anim-box', (e) ->
        e.stopPropagation()
        box = $(this).data('object')
        form.bind(box)
    )
    
    $('#create-box').click(->
        box = new AnimBox();
        $('#canvas').append(box.el())
        form.bind(box)
    );
)