import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { Cell, CellStyle, Codec, DragSource, Geometry, Graph, InternalEvent, KeyHandler, MaxToolbar, RubberBandHandler, gestureUtils, registerAllCodecs, xmlUtils } from '@maxgraph/core';

@Component({
  selector: 'app-max-graph-diagram',
  templateUrl: './max-graph-diagram.component.html',
  styleUrls: ['./max-graph-diagram.component.scss']
})
export class MaxGraphDiagramComponent implements OnInit, AfterViewInit {
  @ViewChild('graphContainer', { static: true }) graphContainer: ElementRef | null | undefined = null;
  @ViewChild('toolbarContainer', { static: true }) toolbarContainer: ElementRef | null | undefined = null;
  @ViewChild('importFileInput') importFileInput: ElementRef<HTMLInputElement> | null | undefined = null;
  protected graph: Graph | null = null;
  protected toolbar: MaxToolbar | null = null;

  constructor() { }

  public ngOnInit(): void {
   
  }

  public ngAfterViewInit(): void {
    if (this.graphContainer instanceof ElementRef && this.toolbarContainer instanceof ElementRef) {
      const container = this.graphContainer.nativeElement;
      this.graph = new Graph(container);
      this.toolbar = new MaxToolbar(this.toolbarContainer.nativeElement)
      this.graph.setConnectable(true);
      this.graph.cellsEditable = true;
      this.graph.htmlLabels = true;
      this.graph.getStylesheet().getDefaultEdgeStyle().edgeStyle = 'orthogonalEdgeStyle';
      this.graph.getStylesheet().getDefaultEdgeStyle().noLabel = true;
      this.graph.getStylesheet().getDefaultVertexStyle().editable = true;
      this.graph.addListener(InternalEvent.ADD_CELLS, () => {
        this.updateTables();
      })
      this.graph.addListener(InternalEvent.CELL_CONNECTED, () => {
        this.updateTables();
      })
      
      new RubberBandHandler(this.graph);
      const keyHandler = new KeyHandler(this.graph);

      DragSource.prototype.getDropTarget = function (graph: Graph, x: number, y: number, _evt: MouseEvent) {
        let cell = graph.getCellAt(x, y);
        if (cell && !graph.isValidDropTarget(cell)) {
          cell = null;
        }
        return cell;
      };
  
      // Пример настройки графа и добавления ячеек
      const parent = this.graph.getDefaultParent();
      this.graph.batchUpdate(()=> {
        if (this.graph === null) {
          return;
        }
        const v1 = this.graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
        v1.setAttribute('description', '');
        const v2 = this.graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
        v2.setAttribute('description', '');
        const e1 = this.graph.insertEdge(parent, null, '', v1, v2);
      })
      
      const addToolbarItem = (graph: Graph, toolbar: MaxToolbar, prototype: Cell, image: string) => {
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        const funct = (graph: Graph, evt: MouseEvent, cell: Cell | null) => {
          graph.stopEditing(false);
          const pt = graph.getPointForEvent(evt);
          const vertex = graph.getDataModel().cloneCell(prototype);
          vertex?.setValue('New Vertex')
          if (!vertex) return;
          if (vertex.geometry) {
            vertex.geometry.x = pt.x;
            vertex.geometry.y = pt.y;
          }
          vertex.setAttribute('description', '');
          graph.setSelectionCells(graph.importCells([vertex], 0, 0, cell));
          this.updateTables();
        };
    
        // Creates the image which is used as the drag icon (preview)
        const img = toolbar.addMode(null, image, funct, '');
        gestureUtils.makeDraggable(img, graph, funct);
      }
      const addVertex = (icon: string, w: number, h: number, style: CellStyle) => {
        if (this.graph === null || this.toolbar === null) {
          return;
        }
        const vertex = new Cell(null, new Geometry(0, 0, w, h), style);
        vertex.setVertex(true);
        addToolbarItem(this.graph, this.toolbar, vertex, icon);
      }
      addVertex('assets/images/swimlane.gif', 120, 160, {
        shape: 'swimlane',
        startSize: 20
      });
      addVertex('assets/images/rectangle.gif', 100, 40, {});
      addVertex('assets/images/rounded.gif', 100, 40, {
        rounded: true
      });
      addVertex('assets/images/ellipse.gif', 40, 40, {
        shape: 'ellipse'
      });
      addVertex('assets/images/rhombus.gif', 40, 40, {
        shape: 'rhombus'
      });
      addVertex('assets/images/triangle.gif', 40, 40, {
        shape: 'triangle'
      });
      addVertex('assets/images/cylinder.gif', 40, 40, {
        shape: 'cylinder'
      });
      addVertex('assets/images/actor.gif', 30, 40, {
        shape: 'actor'
      });
      this.toolbar.addLine();
      
    }

    
  }
  protected selectAll(): void {
    if (this.graph === null) {
      return;
    }
    this.graph.selectAll();
  }

  // Метод для удаления всех объектов
  protected deleteAll(): void {
    if (this.graph === null) {
      return;
    }
    const cells = this.graph.getDefaultParent().getChildCells(true, true);
    this.graph.removeCells(cells);
    this.updateTables();
  }

  protected addVertex(): void {
    if (this.graph === null) {
      return;
    }
    const parent = this.graph.getDefaultParent();
    this.graph.batchUpdate(()=> {
      if (this.graph === null) {
        return;
      }
      const vertex = this.graph.insertVertex(parent, null, 'New Vertex', 100, 100, 80, 30);
      (vertex as any).description = 'Added with Button';
      this.graph.startEditingAtCell(vertex)
    })
  }

  protected deleteSelected(): void {
    if (this.graph === null) {
      return;
    }
    this.graph.removeCells(this.graph.getSelectionCells());
    this.updateTables();
  }

  protected clearSelection(): void {
    if (this.graph === null) {
      return;
    }
    this.graph.clearSelection();
  }

  protected export() {
    if (this.graph === null) {
      return;
    }
    const encoder = new Codec();
    registerAllCodecs();
    const node = encoder.encode(this.graph.getDataModel());
    if (node !== null){
      const xml = xmlUtils.getXml(node);
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.xml';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  protected importFileSource: string | null = null;

  protected onImportFileChange(){
    if (this.importFileInput instanceof ElementRef) {
      if (this.importFileInput.nativeElement.files !== null){
        if (typeof (FileReader) !== 'undefined') {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.importFileSource = e.target.result;
          };
          reader.readAsText(this.importFileInput.nativeElement.files[0]);
        }
      }
    }
  }

  protected import() {
    if (this.importFileSource === null) {
      return;
    }
    if (this.graph === null) {
      return;
    }
    const t = xmlUtils.parseXml(this.importFileSource)
    const encoder = new Codec(t);
    registerAllCodecs();
    encoder.decode(t.documentElement, this.graph.getDataModel());
    this.updateTables();
  }
  
  protected vertices: Cell[] = [];
  protected edges: Cell[] = [];
  
  private updateTables(): void {
    if (this.graph === null) {
      return;
    }
    const cells = this.graph.getDefaultParent().getChildCells(true, true);
    this.vertices = cells.filter(cell => cell.isVertex());
    this.edges = cells.filter(cell => cell.isEdge());
  }
  

  protected onEdgeChange(edge: Cell) {
    const ogEdge = this.edges.findIndex(x => x.id == edge.id);
    this.edges[ogEdge] = edge;
  }

  protected onVertexChange(vertex: Cell) {
    const ogVertex = this.vertices.findIndex(x => x.id == vertex.id);
    this.vertices[ogVertex] = vertex;
    if (this.graph === null) {
      return;
    }
    this.graph.cellLabelChanged(this.vertices[ogVertex], vertex.value, false);
  }

}