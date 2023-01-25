if (typeof($) !== 'undefined' && typeof(bootstrap) !== 'undefined') {
  const $modal = $(`
  <div class="modal fade pyerr-modal" id="pyerr-modal" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title"></h3>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      </div>
    </div>
  </div>
</div>
  `)

  $('body').append($modal)
  $.fn.renderExplainerButton = function () {
    var self = this;
    self.find('pre.pyerr-result').each(function (_, pre) {
      var $pre = $(pre);
      console.log($pre.text())
      const explanation = explain($pre.text())

      if (explanation) {
        var $explain = $('<span>', {
          class: 'pyerr-explain',
          html: '<i class="fas fa-fw fa-question-circle" primary"></i>',
          click: function () {
            const translation = explanation.translate("es");

            $modal.find('.modal-title').text(translation.header);
            $modal.find('.modal-body').text(translation.details);

            new bootstrap.Modal('#pyerr-modal').show();
          }
        });
        $pre.append($explain);
      }
    });
    return self;
  };
  
  $('.pyerr-results').renderExplainerButton()
}