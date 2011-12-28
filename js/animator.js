(function() {
  var AnimBox, PropertyForm;

  PropertyForm = (function() {

    function PropertyForm() {
      var form;
      form = this;
      this.fields = $('#properties .property-field').val('').on('change', function() {
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
      $('#current-frame').val(0).on('change', function() {
        form.currentFrame = $(this).val();
        return AnimBox.setCurrentFrame(form.currentFrame);
      });
    }

    PropertyForm.prototype.box = null;

    PropertyForm.prototype.currentFrame = 0;

    PropertyForm.prototype.bind = function(box) {
      var prop, value, _ref;
      var _this = this;
      if (this.box) this.unbind();
      this.box = box;
      _ref = this.box.properties[this.currentFrame];
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
    var _formats, _onDrag, _onResize;

    function AnimBox(id) {
      var _base;
      this.id = id;
      this.properties = {};
      this.properties[AnimBox.currentFrame] = {};
      (_base = this.properties[AnimBox.currentFrame])['id'] || (_base['id'] = "box-" + AnimBox.nextId++);
    }

    AnimBox.nextId = 0;

    AnimBox.currentFrame = 0;

    AnimBox.setCurrentFrame = function(frame) {
      this.currentFrame = frame;
      return $('.anim-box').each(function() {
        return $(this).data('object').loadFrame(frame);
      });
    };

    _formats = {
      normal: function(s) {
        return s;
      },
      pixel: function(s) {
        return "" + s + "px";
      }
    };

    AnimBox.propTypes = {
      id: {
        access: 'attr',
        format: _formats.normal
      },
      top: {
        access: 'css',
        format: _formats.pixel
      },
      left: {
        access: 'css',
        format: _formats.pixel
      },
      height: {
        access: 'css',
        format: _formats.pixel
      },
      width: {
        access: 'css',
        format: _formats.pixel
      }
    };

    AnimBox.prototype.el = function() {
      return this._el || (this._el = $('<div id="' + this.properties.id + '" class="anim-box" />').data('object', this).draggable({
        drag: _onDrag
      }).resizable({
        resize: _onResize
      }));
    };

    AnimBox.prototype.set = function(prop, value, update) {
      var type, _base, _name;
      if (update == null) {
        update = {
          fromForm: true,
          fromCanvas: true
        };
      }
      ((_base = this.properties)[_name = AnimBox.currentFrame] || (_base[_name] = {}))[prop] = value;
      if (update.fromForm) {
        if (type = AnimBox.propTypes[prop]) {
          this.el()[type.access](prop, type.format(value));
        }
      }
      if (update.fromCanvas && this.selected()) {
        return this.el().trigger('propChange', [prop, value]);
      }
    };

    AnimBox.prototype.get = function(prop) {
      var type, _base;
      return (_base = this.properties[AnimBox.currentFrame])[prop] || (_base[prop] = (type = AnimBox.propTypes[prop]) ? this.el()[type.access](prop) : null);
    };

    AnimBox.prototype.selected = function() {
      return this.el().is('.selected');
    };

    AnimBox.prototype.loadFrame = function(frameToLoad) {
      var frame, lowerFrames, prop, props, value, _ref, _ref2, _results;
      lowerFrames = [];
      _ref = this.properties;
      for (frame in _ref) {
        props = _ref[frame];
        if (parseInt(frame) <= parseInt(frameToLoad)) lowerFrames.push(frame);
      }
      frame = Math.max.apply(Math, lowerFrames);
      _ref2 = this.properties[frame];
      _results = [];
      for (prop in _ref2) {
        value = _ref2[prop];
        _results.push(this.set(prop, value));
      }
      return _results;
    };

    AnimBox.prototype.generateCss = function() {
      var css, frame, id, prefix, prop, props, type, value, _i, _len, _ref, _ref2;
      css = "";
      _ref = ['-webkit-', '-moz-', '-ms-', '-o-', ''];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prefix = _ref[_i];
        id = this.el().attr('id');
        css += "#" + id + " {" + prefix + "animation: " + prefix + id + "-animation 5s 2s ease infinite alternate}\n";
        css += "@" + prefix + "keyframes " + prefix + id + "-animation {\n";
        _ref2 = this.properties;
        for (frame in _ref2) {
          props = _ref2[frame];
          css += "\t" + frame + "%{\n";
          for (prop in props) {
            value = props[prop];
            type = AnimBox.propTypes[prop];
            if (type && type.access === 'css') {
              css += "\t\t" + prop + ": " + (type.format(value)) + ";\n";
            }
          }
          css += "\t}\n";
        }
        css += "}\n";
      }
      return css;
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
    var form, selectBox;
    form = new PropertyForm();
    selectBox = function($el) {
      $('.selected').removeClass('selected');
      $el.addClass('selected');
      return form.bind($el.data('object'));
    };
    $('#canvas').on('mousedown', '.anim-box', function(e) {
      e.stopPropagation();
      return selectBox($(this));
    });
    $('#create-box').click(function() {
      var box;
      box = new AnimBox();
      $('#canvas').append(box.el());
      return selectBox(box.el());
    });
    return $('#show-animation').click(function() {
      var $iframe, boxCss, boxHtml;
      boxHtml = "";
      boxCss = "";
      $('.anim-box').each(function() {
        var box, id;
        box = $(this).data('object');
        id = box.get('id');
        boxHtml += "<div id='" + id + "'></div>";
        return boxCss += box.generateCss();
      });
      return $iframe = $('<iframe src="animator-frame.html" />').appendTo(document.body).load(function() {
        $iframe.contents().find('#custom').html(boxCss);
        return $iframe.contents().find('#canvas').html(boxHtml);
      });
    });
  });

}).call(this);
