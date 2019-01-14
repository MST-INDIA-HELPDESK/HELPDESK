import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageknowledgebaseComponent } from './manageknowledgebase.component';

describe('ManageknowledgebaseComponent', () => {
  let component: ManageknowledgebaseComponent;
  let fixture: ComponentFixture<ManageknowledgebaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageknowledgebaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageknowledgebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
