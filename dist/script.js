// Table Editor Script
class TableEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.pasteArea = document.getElementById('pasteArea');
        this.htmlOutput = document.getElementById('htmlOutput');
        this.selectedCells = new Set();
        this.currentCell = null;
        this.storageKey = 'wysiwyg-table-content';
        
        this.initEventListeners();
        this.loadFromStorage();
    }
    
    saveToStorage() {
        try {
            // Clean up selection classes before saving
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.editor.innerHTML;
            tempDiv.querySelectorAll('.selected').forEach(cell => {
                cell.classList.remove('selected');
            });
            localStorage.setItem(this.storageKey, tempDiv.innerHTML);
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved && saved !== '<p class="text-muted">Paste content in the Paste Content area above to start editing.</p>') {
                this.editor.innerHTML = saved;
                this.updateOutput();
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    }
    
    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Failed to clear localStorage:', e);
        }
    }

    initEventListeners() {
        // Paste and parse - trigger automatically on paste
        this.pasteArea.addEventListener('paste', () => {
            // Use setTimeout to allow the paste to complete before parsing
            setTimeout(() => this.parseAndCreateTable(), 10);
        });
        
        // Table actions
        document.getElementById('addRowBtn').addEventListener('click', () => this.addRow());
        document.getElementById('addColBtn').addEventListener('click', () => this.addColumn());
        document.getElementById('deleteRowBtn').addEventListener('click', () => this.deleteRow());
        document.getElementById('deleteColBtn').addEventListener('click', () => this.deleteColumn());
        document.getElementById('mergeCellsBtn').addEventListener('click', () => this.mergeCells());
        document.getElementById('splitCellBtn').addEventListener('click', () => this.splitCell());
        
        // Column movement
        document.getElementById('moveColLeftBtn').addEventListener('click', () => this.moveColumn('left'));
        document.getElementById('moveColRightBtn').addEventListener('click', () => this.moveColumn('right'));
        
        // Class management
        document.getElementById('addClassBtn').addEventListener('click', () => this.addClass());
        document.getElementById('removeClassBtn').addEventListener('click', () => this.removeClass());
        
        // Export
        document.getElementById('copyHtmlBtn').addEventListener('click', () => this.copyHtml());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearTable());
        
        // Cell selection
        this.editor.addEventListener('click', (e) => this.handleCellClick(e));
        this.editor.addEventListener('input', () => {
            this.updateOutput();
            this.saveToStorage();
        });
        
        // Multi-select with Shift
        this.editor.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        
        // UI Toggles
        document.getElementById('togglePasteBtn').addEventListener('click', () => this.togglePasteSection());
        document.getElementById('toggleWidthBtn').addEventListener('click', () => this.toggleContainerWidth());
        document.getElementById('toggleEditorWidth').addEventListener('click', () => this.toggleColumnWidth('editor'));
        document.getElementById('togglePreviewWidth').addEventListener('click', () => this.toggleColumnWidth('preview'));
        
        // Quick class buttons
        document.querySelectorAll('.quick-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addQuickClass(btn.dataset.class);
            });
        });
        
        // Global paste handler for Paste Content textarea
        document.addEventListener('keydown', (e) => {
            // Check for Ctrl+V (Windows/Linux) or Cmd+V (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                // Don't interfere if user is typing in the editor or other text areas
                const activeElement = document.activeElement;
                const isEditorActive = activeElement === this.editor || this.editor.contains(activeElement);
                const isHtmlOutputActive = activeElement === this.htmlOutput;
                const isClassInputActive = activeElement === document.getElementById('classInput');
                
                // Only redirect paste to pasteArea if not in these specific elements
                if (!isEditorActive && !isHtmlOutputActive && !isClassInputActive && activeElement !== this.pasteArea) {
                    e.preventDefault();
                    this.pasteArea.focus();
                    // Let the default paste action happen in the textarea
                    setTimeout(() => {
                        this.pasteArea.focus();
                    }, 0);
                }
            }
        });
        
        // Set default full width
        this.setDefaultFullWidth();
    }
    
    setDefaultFullWidth() {
        const container1 = document.getElementById('mainContainer');
        const container2 = document.getElementById('mainContainer2');
        container1.classList.add('full-width');
        container2.classList.add('full-width');
    }
    
    addQuickClass(className) {
        if (!this.currentCell && this.selectedCells.size === 0) {
            alert('Please select a cell first.');
            return;
        }
        
        const target = document.getElementById('classTarget').value;
        
        switch (target) {
            case 'cell':
                const cellsToStyle = this.selectedCells.size > 0 
                    ? Array.from(this.selectedCells) 
                    : [this.currentCell];
                this.addClassToElements(cellsToStyle, className);
                break;
            case 'row':
                const row = this.currentCell.closest('tr');
                this.addClassToElements([row], className);
                break;
            case 'column':
                const colIndex = Array.from(this.currentCell.parentElement.children).indexOf(this.currentCell);
                const table = this.getTable();
                const colCells = Array.from(table.querySelectorAll('tr')).map(row => row.children[colIndex]);
                this.addClassToElements(colCells, className);
                break;
        }
        
        this.updateOutput();
        this.saveToStorage();
    }

    togglePasteSection() {
        const section = document.getElementById('pasteSection');
        const btn = document.getElementById('togglePasteBtn');
        const icon = btn.querySelector('i');
        
        section.classList.toggle('collapsed');
        
        if (section.classList.contains('collapsed')) {
            icon.className = 'bi bi-chevron-down';
        } else {
            icon.className = 'bi bi-chevron-up';
        }
    }

    toggleContainerWidth() {
        const container1 = document.getElementById('mainContainer');
        const container2 = document.getElementById('mainContainer2');
        
        container1.classList.toggle('full-width');
        container2.classList.toggle('full-width');
    }

    toggleColumnWidth(column) {
        const editorCol = document.getElementById('editorColumn');
        const previewCol = document.getElementById('previewColumn');
        
        if (column === 'editor') {
            editorCol.classList.toggle('full-width');
            if (editorCol.classList.contains('full-width')) {
                previewCol.classList.remove('full-width');
                previewCol.style.display = 'none';
            } else {
                previewCol.style.display = '';
            }
        } else {
            previewCol.classList.toggle('full-width');
            if (previewCol.classList.contains('full-width')) {
                editorCol.classList.remove('full-width');
                editorCol.style.display = 'none';
            } else {
                editorCol.style.display = '';
            }
        }
    }

    parseAndCreateTable() {
        const content = this.pasteArea.value.trim();
        if (!content) return;

        let table;
        
        // Try to detect format and parse
        if (content.includes('<table')) {
            // HTML table
            table = this.parseHtmlTable(content);
        } else if (content.includes('\t')) {
            // TSV (Tab-separated, likely from Google Sheets)
            table = this.parseTSV(content);
        } else if (content.includes(',')) {
            // CSV
            table = this.parseCSV(content);
        } else {
            alert('Could not detect format. Please paste HTML, TSV, or CSV content.');
            return;
        }

        this.editor.innerHTML = table;
        this.updateOutput();
        this.saveToStorage();
        this.pasteArea.value = '';
        
        // Auto-collapse paste section after successful parse
        setTimeout(() => {
            const section = document.getElementById('pasteSection');
            const btn = document.getElementById('togglePasteBtn');
            const icon = btn.querySelector('i');
            
            if (!section.classList.contains('collapsed')) {
                section.classList.add('collapsed');
                icon.className = 'bi bi-chevron-down';
            }
        }, 300);
    }

    parseHtmlTable(html) {
        // Preserve all HTML including wrappers like <figure>, etc.
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const table = tempDiv.querySelector('table');
        
        if (table) {
            // Check if table has a parent wrapper (like figure)
            const wrapper = table.closest('figure, div[class*="wp-"]');
            if (wrapper && wrapper.parentElement === tempDiv) {
                // Return the wrapper with the table inside
                return wrapper.outerHTML;
            }
            // Return just table if no wrapper found
            return table.outerHTML;
        }
        
        // If no table found, try to create one from the content
        return this.createDefaultTable(3, 3);
    }

    parseTSV(tsv) {
        const rows = tsv.trim().split('\n');
        const data = rows.map(row => row.split('\t'));
        return this.createTableFromData(data);
    }

    parseCSV(csv) {
        const rows = csv.trim().split('\n');
        const data = rows.map(row => {
            // Simple CSV parser (doesn't handle quoted commas)
            return row.split(',').map(cell => cell.trim());
        });
        return this.createTableFromData(data);
    }

    createTableFromData(data) {
        if (!data || data.length === 0) return '';

        let html = '<table>';
        
        // First row as header
        html += '<thead><tr>';
        data[0].forEach(cell => {
            html += `<th>${this.escapeHtml(cell)}</th>`;
        });
        html += '</tr></thead>';
        
        // Rest as body
        if (data.length > 1) {
            html += '<tbody>';
            for (let i = 1; i < data.length; i++) {
                html += '<tr>';
                data[i].forEach(cell => {
                    html += `<td>${this.escapeHtml(cell)}</td>`;
                });
                html += '</tr>';
            }
            html += '</tbody>';
        }
        
        html += '</table>';
        return html;
    }

    createDefaultTable(rows, cols) {
        let html = '<table><thead><tr>';
        for (let c = 0; c < cols; c++) {
            html += `<th>Header ${c + 1}</th>`;
        }
        html += '</tr></thead><tbody>';
        
        for (let r = 0; r < rows - 1; r++) {
            html += '<tr>';
            for (let c = 0; c < cols; c++) {
                html += '<td>Cell</td>';
            }
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        return html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleCellClick(e) {
        const cell = e.target.closest('td, th');
        if (!cell) return;

        // Clear previous selection if not holding Shift
        if (!e.shiftKey) {
            this.clearSelection();
        }

        this.toggleCellSelection(cell);
        this.currentCell = cell;
    }

    handleMouseDown(e) {
        const cell = e.target.closest('td, th');
        if (!cell || !e.shiftKey) return;
        
        e.preventDefault();
    }

    toggleCellSelection(cell) {
        if (this.selectedCells.has(cell)) {
            this.selectedCells.delete(cell);
            cell.classList.remove('selected');
        } else {
            this.selectedCells.add(cell);
            cell.classList.add('selected');
        }
    }

    clearSelection() {
        this.selectedCells.forEach(cell => cell.classList.remove('selected'));
        this.selectedCells.clear();
    }

    getTable() {
        return this.editor.querySelector('table');
    }

    addRow() {
        const table = this.getTable();
        if (!table) {
            this.editor.innerHTML = this.createDefaultTable(3, 3);
            this.updateOutput();
            return;
        }

        const tbody = table.querySelector('tbody') || table;
        const firstRow = table.querySelector('tr');
        const colCount = firstRow ? firstRow.children.length : 3;

        const newRow = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
            const cell = document.createElement('td');
            cell.textContent = 'Cell';
            newRow.appendChild(cell);
        }

        tbody.appendChild(newRow);
        this.updateOutput();
        this.saveToStorage();
    }

    addColumn() {
        const table = this.getTable();
        if (!table) {
            this.editor.innerHTML = this.createDefaultTable(3, 3);
            this.updateOutput();
            return;
        }

        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const cell = document.createElement(index === 0 && row.parentElement.tagName === 'THEAD' ? 'th' : 'td');
            cell.textContent = index === 0 && row.parentElement.tagName === 'THEAD' ? 'Header' : 'Cell';
            row.appendChild(cell);
        });

        this.updateOutput();
        this.saveToStorage();
    }

    deleteRow() {
        if (!this.currentCell) {
            alert('Please select a cell in the row you want to delete.');
            return;
        }

        const row = this.currentCell.closest('tr');
        if (!row) return;

        const table = this.getTable();
        const rows = table.querySelectorAll('tr');
        
        if (rows.length <= 1) {
            alert('Cannot delete the last row.');
            return;
        }

        row.remove();
        this.clearSelection();
        this.currentCell = null;
        this.updateOutput();
        this.saveToStorage();
    }

    deleteColumn() {
        if (!this.currentCell) {
            alert('Please select a cell in the column you want to delete.');
            return;
        }

        const table = this.getTable();
        const cellIndex = Array.from(this.currentCell.parentElement.children).indexOf(this.currentCell);
        const rows = table.querySelectorAll('tr');

        if (rows[0].children.length <= 1) {
            alert('Cannot delete the last column.');
            return;
        }

        rows.forEach(row => {
            if (row.children[cellIndex]) {
                row.children[cellIndex].remove();
            }
        });

        this.clearSelection();
        this.currentCell = null;
        this.updateOutput();
        this.saveToStorage();
    }

    mergeCells() {
        if (this.selectedCells.size < 2) {
            alert('Please select at least 2 cells to merge (Shift+Click to select multiple).');
            return;
        }

        const cells = Array.from(this.selectedCells);
        const firstCell = cells[0];
        
        // Calculate colspan and rowspan
        let minRow = Infinity, maxRow = -Infinity;
        let minCol = Infinity, maxCol = -Infinity;

        cells.forEach(cell => {
            const row = cell.parentElement;
            const rowIndex = Array.from(row.parentElement.children).indexOf(row);
            const colIndex = Array.from(row.children).indexOf(cell);
            
            minRow = Math.min(minRow, rowIndex);
            maxRow = Math.max(maxRow, rowIndex);
            minCol = Math.min(minCol, colIndex);
            maxCol = Math.max(maxCol, colIndex);
        });

        const colspan = maxCol - minCol + 1;
        const rowspan = maxRow - minRow + 1;

        // Merge content
        const content = cells.map(c => c.textContent.trim()).filter(t => t).join(' ');
        firstCell.textContent = content;
        
        if (colspan > 1) firstCell.setAttribute('colspan', colspan);
        if (rowspan > 1) firstCell.setAttribute('rowspan', rowspan);

        // Remove other cells
        cells.slice(1).forEach(cell => cell.remove());

        this.clearSelection();
        this.updateOutput();
        this.saveToStorage();
    }

    splitCell() {
        if (!this.currentCell) {
            alert('Please select a cell to split.');
            return;
        }

        const colspan = parseInt(this.currentCell.getAttribute('colspan') || 1);
        const rowspan = parseInt(this.currentCell.getAttribute('rowspan') || 1);

        if (colspan === 1 && rowspan === 1) {
            alert('This cell is not merged.');
            return;
        }

        // Split horizontally (colspan)
        if (colspan > 1) {
            this.currentCell.removeAttribute('colspan');
            const row = this.currentCell.parentElement;
            const cellIndex = Array.from(row.children).indexOf(this.currentCell);
            
            for (let i = 1; i < colspan; i++) {
                const newCell = document.createElement(this.currentCell.tagName);
                newCell.textContent = 'Cell';
                if (cellIndex + i < row.children.length) {
                    row.insertBefore(newCell, row.children[cellIndex + i]);
                } else {
                    row.appendChild(newCell);
                }
            }
        }

        // Split vertically (rowspan)
        if (rowspan > 1) {
            this.currentCell.removeAttribute('rowspan');
            const table = this.getTable();
            const currentRow = this.currentCell.parentElement;
            const rowIndex = Array.from(currentRow.parentElement.children).indexOf(currentRow);
            const cellIndex = Array.from(currentRow.children).indexOf(this.currentCell);
            
            for (let i = 1; i < rowspan; i++) {
                const targetRow = currentRow.parentElement.children[rowIndex + i];
                if (targetRow) {
                    const newCell = document.createElement(this.currentCell.tagName);
                    newCell.textContent = 'Cell';
                    if (cellIndex < targetRow.children.length) {
                        targetRow.insertBefore(newCell, targetRow.children[cellIndex]);
                    } else {
                        targetRow.appendChild(newCell);
                    }
                }
            }
        }

        this.updateOutput();
        this.saveToStorage();
    }

    moveColumn(direction) {
        if (!this.currentCell) {
            alert('Please select a cell in the column you want to move.');
            return;
        }

        const table = this.getTable();
        const cellIndex = Array.from(this.currentCell.parentElement.children).indexOf(this.currentCell);
        const rows = Array.from(table.querySelectorAll('tr'));

        const newIndex = direction === 'left' ? cellIndex - 1 : cellIndex + 1;
        
        if (newIndex < 0 || newIndex >= rows[0].children.length) {
            alert('Cannot move column further in that direction.');
            return;
        }

        rows.forEach(row => {
            const cells = Array.from(row.children);
            if (direction === 'left') {
                row.insertBefore(cells[cellIndex], cells[newIndex]);
            } else {
                if (newIndex + 1 < cells.length) {
                    row.insertBefore(cells[cellIndex], cells[newIndex + 1]);
                } else {
                    row.appendChild(cells[cellIndex]);
                }
            }
        });

        this.updateOutput();
        this.saveToStorage();
    }

    addClass() {
        const className = document.getElementById('classInput').value.trim();
        const target = document.getElementById('classTarget').value;

        if (!className) {
            alert('Please enter a class name.');
            return;
        }

        if (!this.currentCell && this.selectedCells.size === 0) {
            alert('Please select a cell first.');
            return;
        }

        switch (target) {
            case 'cell':
                // Apply to all selected cells, or just current cell if none selected
                const cellsToStyle = this.selectedCells.size > 0 
                    ? Array.from(this.selectedCells) 
                    : [this.currentCell];
                this.addClassToElements(cellsToStyle, className);
                break;
            case 'row':
                const row = this.currentCell.closest('tr');
                this.addClassToElements([row], className);
                break;
            case 'column':
                const colIndex = Array.from(this.currentCell.parentElement.children).indexOf(this.currentCell);
                const table = this.getTable();
                const colCells = Array.from(table.querySelectorAll('tr')).map(row => row.children[colIndex]);
                this.addClassToElements(colCells, className);
                break;
        }

        document.getElementById('classInput').value = '';
        this.updateOutput();
        this.saveToStorage();
    }

    removeClass() {
        const className = document.getElementById('classInput').value.trim();
        const target = document.getElementById('classTarget').value;

        if (!className) {
            alert('Please enter a class name to remove.');
            return;
        }

        if (!this.currentCell && this.selectedCells.size === 0) {
            alert('Please select a cell first.');
            return;
        }

        switch (target) {
            case 'cell':
                // Remove from all selected cells, or just current cell if none selected
                const cellsToUnstyle = this.selectedCells.size > 0 
                    ? Array.from(this.selectedCells) 
                    : [this.currentCell];
                this.removeClassFromElements(cellsToUnstyle, className);
                break;
            case 'row':
                const row = this.currentCell.closest('tr');
                this.removeClassFromElements([row], className);
                break;
            case 'column':
                const colIndex = Array.from(this.currentCell.parentElement.children).indexOf(this.currentCell);
                const table = this.getTable();
                const colCells = Array.from(table.querySelectorAll('tr')).map(row => row.children[colIndex]);
                this.removeClassFromElements(colCells, className);
                break;
        }

        document.getElementById('classInput').value = '';
        this.updateOutput();
        this.saveToStorage();
    }

    addClassToElements(elements, className) {
        elements.forEach(el => {
            if (el) {
                el.classList.add(...className.split(' '));
            }
        });
    }

    removeClassFromElements(elements, className) {
        elements.forEach(el => {
            if (el) {
                el.classList.remove(...className.split(' '));
            }
        });
    }

    updateOutput() {
        // Get the entire content, not just the table (to preserve wrappers)
        const content = this.editor.innerHTML.trim();
        
        if (content && content !== '<p class="text-muted">Paste content in the Paste Content area above to start editing.</p>') {
            // Clean up selection classes for output
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            tempDiv.querySelectorAll('.selected').forEach(cell => {
                cell.classList.remove('selected');
            });
            this.htmlOutput.value = this.formatHtml(tempDiv.innerHTML);
        } else {
            this.htmlOutput.value = '';
        }
    }

    formatHtml(html) {
        // Proper HTML beautifier with indentation
        let formatted = '';
        let indent = 0;
        const tab = '  '; // 2 spaces
        
        // Split by tags
        const tags = html.match(/<[^>]+>|[^<]+/g) || [];
        
        tags.forEach(tag => {
            if (tag.trim() === '') return;
            
            // Closing tag
            if (tag.match(/^<\/\w/)) {
                indent--;
                formatted += tab.repeat(Math.max(0, indent)) + tag.trim() + '\n';
            }
            // Self-closing or opening tag
            else if (tag.match(/^</)) {
                formatted += tab.repeat(indent) + tag.trim() + '\n';
                // Don't increase indent for self-closing tags
                if (!tag.match(/\/>$/) && !tag.match(/<\/(\w+)>$/)) {
                    // Only increase indent for opening tags (not closing)
                    if (!tag.match(/^<\//)) {
                        indent++;
                    }
                }
            }
            // Text content
            else {
                const trimmed = tag.trim();
                if (trimmed) {
                    formatted += tab.repeat(indent) + trimmed + '\n';
                }
            }
        });
        
        // Remove excessive blank lines
        return formatted.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    }

    copyHtml() {
        const html = this.htmlOutput.value;
        if (!html) {
            this.showToast('No table to copy. Create a table first.', 'warning');
            return;
        }

        navigator.clipboard.writeText(html).then(() => {
            this.showToast('HTML copied to clipboard! Ready to paste into WordPress.', 'success');
        }).catch(err => {
            // Fallback for older browsers
            this.htmlOutput.select();
            document.execCommand('copy');
            this.showToast('HTML copied to clipboard! Ready to paste into WordPress.', 'success');
        });
    }

    showToast(message, type = 'success') {
        const toastEl = document.getElementById('copyToast');
        const toastHeader = toastEl.querySelector('.toast-header');
        const toastBody = toastEl.querySelector('.toast-body');
        
        // Update toast styling based on type
        toastHeader.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        if (type === 'success') {
            toastHeader.classList.add('bg-success');
        } else if (type === 'warning') {
            toastHeader.classList.add('bg-warning');
        } else if (type === 'danger') {
            toastHeader.classList.add('bg-danger');
        }
        
        // Update message
        toastBody.textContent = message;
        
        // Show toast
        const toast = new bootstrap.Toast(toastEl, {
            autohide: true,
            delay: 3000
        });
        toast.show();
    }

    clearTable() {
        if (confirm('Are you sure you want to clear the table?')) {
            this.editor.innerHTML = '<p class="text-muted">Paste content in the Paste Content area above to start editing.</p>';
            this.htmlOutput.value = '';
            this.clearSelection();
            this.currentCell = null;
            this.clearStorage();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TableEditor();
});
