(function() {
    // Sudoku data.
    var SUDOKU_DATA;
    // Game level.
    var GAME_LEVEL;
    // True if the game is over (win or not), false otherwise.
    $(document).ready(function() {
        SUDOKU_DATA = Array(81).fill(0);
        GAME_LEVEL = "beginner";
        generateSudokuGrid();
        generateSelectionGrid();
        generateSudoku();
        $('#message').hide();
        displaySudokuGrid(GAME_LEVEL);
        $("#sudoku-grid > .case").click(clickCaseSudokuGrid);
        $("#sudoku-grid > .case").dblclick(doubleClickCaseSudokuGrid);
        $("#selection-grid > .case").click(clickCaseSelectionGrid);
        $("#validate").click(checkGrid);
        $("#reset").click(resetGame);
        // Create runner (time of a party).
        $('#runner').runner();
        $('#runner').runner('start');
    });
    // ----------------------------------------------------------------------------
    /** Actions to perform when double-click on a case. */
    const doubleClickCaseSudokuGrid = function() {
        var $curentCaseInSudokuGrid = $(this);
        var $curentCaseInSelectionGrid = $("#selection-grid").find(".case-selected");
        if (!$curentCaseInSudokuGrid.hasClass("case-fixed")) {
            $curentCaseInSudokuGrid.text("");
            if ($curentCaseInSelectionGrid.length > 0) {
                $curentCaseInSudokuGrid.text($curentCaseInSelectionGrid.text());
            }
        };
    }
    // ----------------------------------------------------------------------------
    /** Actions to perform when selected a case in selection grid. */
    const clickCaseSelectionGrid = function() {
        var $curentCaseInSelectionGrid = $(this);
        var $curentCaseInSudokuGrid = $("#sudoku-grid").find(".case-selected");
        if (!$curentCaseInSelectionGrid.hasClass("case-selected")) {
            // Unselect case.
            $("#selection-grid > .case").removeClass("case-selected");
            // Select case.
            $("#selection-grid").removeClass("case-selected");
            $curentCaseInSelectionGrid.addClass("case-selected");
            // Input into sudoku grid.
            if ($curentCaseInSudokuGrid.length > 0 && !$curentCaseInSudokuGrid.hasClass("case-fixed")) {
                $curentCaseInSudokuGrid.text($curentCaseInSelectionGrid.text());
            }
        } else {
            // Unselect case.
            $("#selection-grid > .case").removeClass("case-selected");
        }
    }
    // ----------------------------------------------------------------------------
    /** Actions to perform when selected a case in sudoku grid. */
    const clickCaseSudokuGrid = function() {
        var $curentSelection = $(this);
        if (!$curentSelection.hasClass("case-selected")) {
            // Remove previous selection.
            removeSelection();
            // Highlight curent line/column.
            $("#sudoku-grid").find("[data-col='" + $curentSelection.data('col') + "']").addClass('col-selected');
            $("#sudoku-grid").find("[data-line='" + $curentSelection.data('line') + "']").addClass('line-selected');
            // Highlight cases with same number.
            $curentSelection.addClass("case-selected");
            if ($curentSelection.text() != "") $("#sudoku-grid").sameNumberCases($curentSelection.text()).addClass("case-same-number");
        } else {
            removeSelection();
        }
    }
    // ----------------------------------------------------------------------------
    /** Remove selection of the grid. */
    const removeSelection = function() {
        $("#sudoku-grid").find(".case-selected").removeClass("case-selected");
        $("#sudoku-grid").find(".col-selected").removeClass("col-selected");
        $("#sudoku-grid").find(".line-selected").removeClass("line-selected");
        $("#sudoku-grid").find(".case-same-number").removeClass("case-same-number");
    }
    // ----------------------------------------------------------------------------
    /** Reset game. */
    const resetGame = function() {
        $("#message").hide();
        $("#sudoku-grid").find(".case-fixed").removeClass('case-fixed');
        $("#sudoku-grid").find(".case-error").removeClass('case-error');
        removeSelection();
        generateSudoku();
        GAME_LEVEL = $('#difficulty').val();
        displaySudokuGrid();
        $('#runner').runner('reset');
        $('#runner').runner('start');
    }
    // ----------------------------------------------------------------------------
    /** Check cases of the grid and indicate if win or not. */
    const checkGrid = function() {
        // Delete error cases.
        $("#sudoku-grid").find(".case-error").removeClass('case-error')
        var win = true;
        // Check non-fixed cases.
        $("#sudoku-grid").find(".case:not(.case-fixed)").each(function() {
            if ($(this).text() != $(this).data('value')) {
                $(this).addClass('case-error');
                win = false;
            }
        });
        if (win) winGame();
        else errorsInGame();
    }
    // ----------------------------------------------------------------------------
    /** Win game. */
    const winGame = function() {
        $('#message').text("You win!")
        $('#runner').runner('stop');
        $('#message').show();
    }
    // ----------------------------------------------------------------------------
    /** Erors have been found. */
    const errorsInGame = function() {
        $('#message').text("Some errors have been found.");
        $('#message').show();
    }

    // ----------------------------------------------------------------------------
    /** Generate data of sudoku. */
    const generateSudoku = function() {
        var isGenerated = false;
        do {
            resetSudokuData();
            solve(SUDOKU_DATA);
            // Problem with sudoku generation? Sometimes, there are lot of zeroes.
            // TODO: Change algorithm, but for the moment re-generate when happens.
            var nbZeroes = 0;
            SUDOKU_DATA.forEach(function(element) {
                if (element == 0) {
                    ++nbZeroes;
                }
            });
            if (nbZeroes == 0) {
                isGenerated = true;
            }
        } while (isGenerated == false);
    }
    // ----------------------------------------------------------------------------
    /** Generate HTML sudoku grid.*/
    const generateSudokuGrid = function() {
        var indexId = 1;
        var indexLine = 1;
        var indexColumn = 1;
        var indexBox = 1;
        var box = 1;
        for (indexLine = 1; indexLine <= 9; indexLine++) {
            indexBox = box;
            for (indexColumn = 1; indexColumn <= 9; indexColumn++) {
                $("#sudoku-grid").append('<div class="case" data-id="' + indexId + '" data-box="' + indexBox + '" data-line="' + indexLine + '" data-col="' + indexColumn + '" data-value=""></div>');
                if (indexColumn % 3 == 0) indexBox++;
                indexId++;
            }
            if (indexLine % 3 == 0) box += 3;
        }
    }
    // ----------------------------------------------------------------------------
    /** Generate HTML selection grid.*/
    const generateSelectionGrid = function() {
        for (var indexId = 1; indexId <= 9; indexId++) {
            $("#selection-grid").append('<div class="case">' + indexId + '</div>');
        }
    }
    // ----------------------------------------------------------------------------
    /** Reset of sudoku data.*/
    const resetSudokuData = function() {
        for (var i = 0; i < SUDOKU_DATA.length; i++) SUDOKU_DATA[i] = 0;
    }
    // ----------------------------------------------------------------------------
    /** Display sudoku grid according to the GAME_LEVEL level. */
    const displaySudokuGrid = function() {
        SUDOKU_DATA.forEach(function(element, index) {
            var indexSudoku = ++index;
            $("#sudoku-grid").find('.case[data-id=' + indexSudoku + ']').attr('data-value', element).text(element);
        });
        // Number of total blanks depends on GAME_LEVEL level.
        switch (GAME_LEVEL.toLowerCase()) {
            case "beginner":
                nbBlanks = 48;
                break;
            case "easy":
                nbBlanks = 46;
                break;
            case "normal":
                nbBlanks = 50;
                break;
            case "expert":
                nbBlanks = 54;
                break;
            case "devil":
                nbBlanks = 56;
                break;
        }
        var isFinished = false;
        var freeCase;
        do {
            freeCase = $("#sudoku-grid").find(".case:not([class*='case-fixed'])").random();
            // Before to fix the case, check if line/box/column is not nearly full.
            if (!freeCase.nbCasesFixed(7)) {
                freeCase.addClass("case-fixed");
                --nbBlanks;
            }
            if (nbBlanks == 0) {
                isFinished = true;
            }
        } while (isFinished == false)
        // Delete number in free cases.
        $("#sudoku-grid").find(".case:not([class*='case-fixed'])").text("");
    }
    // ----------------------------------------------------------------------------
    /** Pick up randomly an element in a list returned by a jQuery selector.*/
    $.fn.random = function() {
        // jQuery.fn = jQuery.prototype, extends JQuery functionalities.
        return this.eq(Math.floor(Math.random() * this.length));
    }
    // ----------------------------------------------------------------------------
    /** Determine if the line/column/box of the curent case has 'nbCases' fixed.*/
    $.fn.nbCasesFixed = function(nbCases) {
        // jQuery.fn = jQuery.prototype, extends JQuery functionalities.
        return this.siblings(".case-fixed[data-box='" + this.eq(0).data('box') + "']").length == nbCases || this.siblings(".case-fixed[data-line='" + this.eq(0).data('line') + "']").length == nbCases || this.siblings(".case-fixed[data-col='" + this.eq(0).data('col') + "']").length == nbCases;
    }
    // ----------------------------------------------------------------------------
    /**  Return the list of case with the same number excluding the selected case. */
    $.fn.sameNumberCases = function(caseNumber) {
        // jQuery.fn = jQuery.prototype, extends JQuery functionalities.
        return this.find(".case:contains('" + caseNumber + "'):not([class*='case-selected'])");
    }
})();