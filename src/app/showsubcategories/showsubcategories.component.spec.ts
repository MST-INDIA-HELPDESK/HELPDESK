import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowsubcategoriesComponent } from './showsubcategories.component';

describe('ShowsubcategoriesComponent', () => {
  let component: ShowsubcategoriesComponent;
  let fixture: ComponentFixture<ShowsubcategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowsubcategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowsubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
