import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Cell } from '@maxgraph/core';

@Component({
  selector: 'app-vertex-table',
  templateUrl: './vertex-table.component.html',
  styleUrls: ['./vertex-table.component.scss']
})
export class VertexTableComponent implements OnInit, AfterViewInit {
  @Input() public items: Cell[] = [];
  @Input() public edges: Cell[] = [];

  @Output() public edgeChange = new EventEmitter<Cell>();
  @Output() public vertexChange = new EventEmitter<Cell>();

  @ViewChild('floatingWindow') floatingWindow: ElementRef<HTMLDivElement> | null | undefined = null;
  @ViewChild('floatingWindowDescription') floatingWindowDescription: ElementRef<HTMLDivElement> | null | undefined = null;

  protected displayedColumns: string[] = ['id', 'label', 'description'];

  private floatingWindowBottom: number = 0;
  private mutationObserver = new MutationObserver(() => {
    if (this.floatingWindow instanceof ElementRef) {
      this.floatingWindow.nativeElement.style.bottom = this.floatingWindowBottom  + 'px';
      if (this.floatingWindow.nativeElement.getBoundingClientRect().top < 0) {
        this.floatingWindow.nativeElement.style.bottom = this.floatingWindowBottom + this.floatingWindow.nativeElement.getBoundingClientRect().top + 'px';
      }
    }
  })

  @HostListener('window:click') onClick() {
    this.selectedVertex = null;
    this.selectedVertexEdges = [];
    this.edittableVertex = null;
  }

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.floatingWindow instanceof ElementRef) {
      this.mutationObserver.observe(this.floatingWindow.nativeElement, {
        childList: true,
        subtree: true
      })
    }
  }

  protected selectedVertex: Cell | null = null;
  protected selectedVertexEdges: Cell[] = [];

  protected getDescriptionByVertex(vertex: Cell): string {
    return (vertex as any).description ?? '';
  }

  protected onVertexValueClicked(vertex: Cell, clickEvent: MouseEvent): void {
    clickEvent.stopImmediatePropagation();
    this.edittableVertex = null;
    this.selectedVertex = vertex;
    this.selectedVertexEdges = this.edges.filter(edge => edge.target?.id === vertex.id || edge.source?.id === vertex.id);
    if (this.floatingWindow instanceof ElementRef) {
      this.floatingWindow.nativeElement.style.left = clickEvent.clientX + 20 + 'px';
      this.floatingWindowBottom = window.innerHeight - clickEvent.clientY + 20;
      this.floatingWindow.nativeElement.style.bottom = this.floatingWindowBottom  + 'px';
      if (this.floatingWindow.nativeElement.getBoundingClientRect().top < 0) {
        this.floatingWindow.nativeElement.style.bottom = this.floatingWindowBottom + this.floatingWindow.nativeElement.getBoundingClientRect().top + 'px';
      }
    }
  }

  protected onEdgeChange(edge: Cell) {
    this.edgeChange.emit(edge);
  }

  protected edittableVertex: Cell | null = null;
  protected newDescription: string | null = null;

  protected editVertex(vertex: Cell, clickEvent: MouseEvent) {
    clickEvent.stopImmediatePropagation();
    this.selectedVertex = null;
    this.selectedVertexEdges = [];
    if (this.floatingWindowDescription instanceof ElementRef) {
      this.floatingWindowDescription.nativeElement.style.left = clickEvent.clientX + 20 + 'px';
      this.floatingWindowDescription.nativeElement.style.bottom = window.innerHeight - clickEvent.clientY + 20  + 'px';
      if (window.innerHeight - clickEvent.clientY + 20 > window.innerHeight - this.floatingWindowDescription.nativeElement.offsetHeight) {
        this.floatingWindowDescription.nativeElement.style.bottom = window.innerHeight - clickEvent.clientY + 20 - this.floatingWindowDescription.nativeElement.offsetHeight + 'px';
      }
    }
    this.edittableVertex = vertex;
    this.newDescription = (vertex as any).description;
  }

  protected onNewDescriptionChange(value: string) {
    if (this.edittableVertex !== null) {
      (this.edittableVertex as any).description = this.newDescription;
      this.onVertexChange(this.edittableVertex)
    }
  }

  protected onVertexChange(vertex: Cell) {
    this.vertexChange.emit(vertex);
  }

  protected onSelectedVertexChange(vertex: Cell): void {
    this.edittableVertex = null;
    this.selectedVertex = vertex;
    this.selectedVertexEdges = this.edges.filter(edge => edge.target?.id === vertex.id || edge.source?.id === vertex.id);
  }

}


