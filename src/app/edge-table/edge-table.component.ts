import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Cell } from '@maxgraph/core';
import LinkType from '../max-graph-diagram/link-type';

@Component({
  selector: 'app-edge-table',
  templateUrl: './edge-table.component.html',
  styleUrls: ['./edge-table.component.scss']
})
export class EdgeTableComponent implements OnInit, OnChanges {

  @Input() public parent: Cell | null = null;
  @Input() public items: Cell[] = [];
  @Input() public vertices: Cell[] = [];

  @Output() public edgeChange = new EventEmitter<Cell>();

  @HostListener('window:click') onClick() {
    this.edittableEdge = null;
  }

  displayedColumns: string[] = ['id', 'source', 'linkType', 'target'];

  constructor() { }

  ngOnInit(): void {

  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['parent']) {
      this.edittableEdge = null;
    }
  }


  protected getVertexFromId(id: string): Cell | null {
    const vertex = this.vertices.find(x => x.id === id);
    return vertex ?? null;
  }

  protected edittableEdge: Cell | null = null;

  protected editEdge(edge: Cell, clickEvent: MouseEvent) {
    clickEvent.stopImmediatePropagation();
    this.edittableEdge = edge;
  }

  protected getLinkTypeValue(edge: Cell): string {
    if (edge.value === undefined || !this.linkTypeSelectorItems.includes(edge.value)) {
      return 'Не имеет типа связи';
    }
    if (this.parent === null) {
      return this.linkTypeParentLocalization[edge.value as LinkType];
    }
    if (this.parent.id === edge.source?.id) {
      return this.linkTypeParentLocalization[edge.value as LinkType];
    }
    if (this.parent.id === edge.target?.id) {
      return this.linkTypeChildLocalization[edge.value as LinkType];
    }
    return 'Не имеет типа связи';
  }

  protected linkTypeSelectorItems: LinkType[] = [
    LinkType.Atribute,
    LinkType.Parent,
    LinkType.Type,
    LinkType.Whole
  ]

  protected linkTypeLocalization: {[key in keyof typeof LinkType ]: string} ={
    Atribute: 'Атрибут',
    Parent: 'Наследование',
    Type: 'Тип',
    Whole: 'Целое/часть'
  }

  protected linkTypeParentLocalization: {[key in keyof typeof LinkType ]: string} ={
    Atribute: 'Имеет атрибут',
    Parent: 'Является родителем',
    Type: 'Тип для',
    Whole: 'Целое для'
  }

  protected linkTypeChildLocalization: {[key in keyof typeof LinkType ]: string} ={
    Atribute: 'Атрибут для',
    Parent: 'Является наследником',
    Type: 'Реализация для',
    Whole: 'Часть от'
  }

  protected onEdgeChanged() {
    if (this.edittableEdge !== null)
    this.edgeChange.emit(this.edittableEdge)
  }
}
