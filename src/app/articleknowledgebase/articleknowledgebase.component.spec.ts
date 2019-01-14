import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleknowledgebaseComponent } from './articleknowledgebase.component';

describe('ArticleknowledgebaseComponent', () => {
  let component: ArticleknowledgebaseComponent;
  let fixture: ComponentFixture<ArticleknowledgebaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleknowledgebaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleknowledgebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
