import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryknowledgebaseComponent } from './categoryknowledgebase.component';

describe('CategoryknowledgebaseComponent', () => {
  let component: CategoryknowledgebaseComponent;
  let fixture: ComponentFixture<CategoryknowledgebaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryknowledgebaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryknowledgebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
