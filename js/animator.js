(function() {
  var AnimBox, PropertyForm;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  PropertyForm = (function() {

    function PropertyForm() {
      var form;
      form = this;
      this.fields = $('#properties input').change(function() {
        var $field, prop;
        $field = $(this);
        if (form.box) {
          prop = $field.attr('id');
          return form.box.set(prop, $field.val(), {
            fromForm: true
          });
        } else {
          return $field.val('');
        }
      });
      this.fields.val('');
    }

    PropertyForm.prototype.box = null;

    PropertyForm.prototype.bind = function(box) {
      var prop, value, _ref;
      var _this = this;
      if (this.box) this.unbind();
      this.box = box;
      _ref = this.box.properties;
      for (prop in _ref) {
        value = _ref[prop];
        $('#' + prop).val(value);
      }
      return this.box.el().on('propChange', function(e, prop, value) {
        return $('#' + prop).val(value);
      });
    };

    PropertyForm.prototype.unbind = function() {
      this.box.el().off('propChange');
      this.box = null;
      return this.fields.val('');
    };

    return PropertyForm;

  })();

  AnimBox = (function() {
    var _onDrag, _onResize;

    function AnimBox(id) {
      var _base;
      this.id = id;
      this.properties = {};
      (_base = this.properties)['id'] || (_base['id'] = "box-" + AnimBox.nextId++);
    }

    AnimBox.nextId = 0;

    AnimBox.htmlAttributes = ['id'];

    AnimBox.cssProperties = ['top', 'left', 'height', 'width'];

    AnimBox.prototype.el = function() {
      return this._el || (this._el = $('<div id="' + this.id + '" class="anim-box" />').data('object', this).draggable({
        drag: _onDrag
      }).resizable({
        resize: _onResize
      }));
    };

    AnimBox.prototype.set = function(prop, value, update) {
      if (update == null) {
        update = {
          fromForm: true,
          fromCanvas: true
        };
      }
      this.properties[prop] = value;
      if (update.fromForm) {
        if (__indexOf.call(AnimBox.htmlAttributes, prop) >= 0) {
          this.el().attr(prop, value);
        } else if (__indexOf.call(AnimBox.cssProperties, prop) >= 0) {
          this.el().css(prop, value);
        }
      }
      if (update.fromCanvas) return this.el().trigger('propChange', [prop, value]);
    };

    AnimBox.prototype.get = function(prop) {
      var _base;
      return (_base = this.properties)[prop] || (_base[prop] = __indexOf.call(AnimBox.htmlAttributes, prop) >= 0 ? this.el().attr(prop) : __indexOf.call(AnimBox.cssProperties, prop) >= 0 ? this.el().css(prop) : null);
    };

    _onDrag = function(e, ui) {
      var box;
      box = ui.helper.data('object');
      box.set('top', ui.position.top, {
        fromCanvas: true
      });
      return box.set('left', ui.position.left, {
        fromCanvas: true
      });
    };

    _onResize = function(e, ui) {
      var box;
      box = ui.helper.data('object');
      box.set('width', ui.size.width, {
        fromCanvas: true
      });
      return box.set('height', ui.size.height, {
        fromCanvas: true
      });
    };

    return AnimBox;

  })();

  $(function() {
    var form;
    form = new PropertyForm();
    $('#canvas').on('mousedown', '.anim-box', function(e) {
      var box;
      e.stopPropagation();
      box = $(this).data('object');
      return form.bind(box);
    });
    return $('#create-box').click(function() {
      var box;
      box = new AnimBox();
      $('#canvas').append(box.el());
      return form.bind(box);
    });
  });

}).call(this);
