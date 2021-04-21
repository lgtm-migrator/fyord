import { Mock, Times } from 'tsmockit';
import { Strings } from 'tsbase/Functions/Strings';
import { Observable } from 'tsbase/Patterns/Observable/Observable';
import { TestHelpers } from '../../utilities/testHelpers';
import { App } from '../app';
import { Page } from '../page';
import { IRouter, ISeoService, Route } from '../services/module';

class FakePage extends Page {
  Template = async () => ('test' as any);
  Route = () => this.routeMatches === true;

  constructor(
    private routeMatches: boolean,
    seoService?: ISeoService,
    app?: App,
    windowDocument?: Document
  ) {
    super(seoService, app, windowDocument);
  }
}

describe('Page', () => {
  let classUnderTest: FakePage;
  const mockDocument = new Mock<Document>();
  const mockRouter = new Mock<IRouter>();
  const mockApp = new Mock<App>();
  const mockSeoService = new Mock<ISeoService>();
  let fakeRouteObservable: Observable<Route>;
  let fakeRoute: Route;

  beforeEach(() => {
    const id = '12345';
    const fakeElement = document.createElement('div');
    fakeRouteObservable = new Observable<Route>();
    fakeRoute = {
      hashParams: [],
      href: '',
      path: '',
      queryParams: new Map<string, string>(),
      routeParams: []
    };
    mockDocument.Setup(d => d.getElementById(''), fakeElement);
    mockRouter.Setup(r => r.Route, fakeRouteObservable);
    mockApp.Setup(a => a.Router, mockRouter.Object);
    mockRouter.Setup(r => r.RouteHandled, id);
    mockSeoService.Setup(s => s.SetDefaultTags());

    classUnderTest = new FakePage(true, mockSeoService.Object, mockApp.Object, mockDocument.Object);
    classUnderTest.Id = id;
  });

  it('should construct', () => {
    expect(classUnderTest).toBeDefined();
  });

  it('should construct with default parameters', () => {
    expect(new FakePage(false)).toBeDefined();
  });

  it('should handle route changes when the new route is not a match', () => {
    classUnderTest = new FakePage(false, mockSeoService.Object, mockApp.Object, mockDocument.Object);
    fakeRouteObservable.Publish(fakeRoute);
    mockRouter.Verify(r => r.RouteHandled, Times.Never);
  });

  it('should handle route changes on match and component is not rendered', async () => {
    mockDocument.Setup(d => d.getElementById('12345'), null);
    const fakeMain = document.createElement('main');
    mockApp.Setup(a => a.Main, fakeMain);
    mockRouter.Setup(r => r.RouteHandled, Strings.Empty);
    classUnderTest = new FakePage(true, mockSeoService.Object, mockApp.Object, mockDocument.Object);

    fakeRouteObservable.Publish(fakeRoute);

    const componentRendered = TestHelpers.TimeLapsedCondition(() =>
      fakeMain.innerHTML.indexOf(`<div id="${classUnderTest.Id}"`) >= 0);
    expect(componentRendered).toBeTruthy();
  });

  it('should handle route changes on match with a different path and the component is rendered', async () => {
    fakeRoute.path = '/new-path';
    const fakeElement = document.createElement('div');
    mockDocument.Setup(d => d.getElementById('12345'), fakeElement);
    const fakeMain = document.createElement('main');
    mockApp.Setup(a => a.Main, fakeMain);
    mockRouter.Setup(r => r.RouteHandled, Strings.Empty);
    classUnderTest = new FakePage(true, mockSeoService.Object, mockApp.Object, mockDocument.Object);

    fakeRouteObservable.Publish(fakeRoute);

    const componentRendered = TestHelpers.TimeLapsedCondition(() =>
      fakeMain.innerHTML.indexOf(`<div id="${classUnderTest.Id}"`) >= 0);
    expect(componentRendered).toBeTruthy();
  });

  it('should not re render if the component is already rendered at the same path', async () => {
    const fakeElement = document.createElement('div');
    mockDocument.Setup(d => d.getElementById('12345'), fakeElement);
    const fakeMain = document.createElement('main');
    mockApp.Setup(a => a.Main, fakeMain);
    mockRouter.Setup(r => r.RouteHandled, Strings.Empty);
    classUnderTest = new FakePage(true, mockSeoService.Object, mockApp.Object, mockDocument.Object);

    fakeRouteObservable.Publish(fakeRoute);

    mockApp.Verify(a => a.Main, Times.Never);
  });

  it('should not render if the client has moved on to another route by the time component is ready', () => {
    mockDocument.Setup(d => d.getElementById('12345'), null);
    const fakeMain = document.createElement('main');
    mockApp.Setup(a => a.Main, fakeMain);
    mockRouter.Setup(r => r.RouteHandled, Strings.Empty);
    classUnderTest = new FakePage(true, mockSeoService.Object, mockApp.Object, mockDocument.Object);

    fakeRouteObservable.Publish(fakeRoute);
    mockRouter.Setup(r => r.RouteHandled, Strings.Empty);

    mockApp.Verify(a => a.Main, Times.Never);
  });
});
