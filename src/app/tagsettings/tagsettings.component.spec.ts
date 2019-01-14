import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsettingsComponent } from './tagsettings.component';

describe('TagsettingsComponent', () => {
  let component: TagsettingsComponent;
  let fixture: ComponentFixture<TagsettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
