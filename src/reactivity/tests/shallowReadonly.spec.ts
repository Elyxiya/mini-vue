import { isReadonly,shallowReadonly } from "../reactive";
describe('shallowReadonly', () => { 
  test("should not make non-reactive properties reactive",() => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props.n)).toBe(false);
    expect(isReadonly(props)).toBe(true);
  })

  it('warn then call set',() => {
    //console.warn()
    //mock
    console.warn = jest.fn();

    const user = shallowReadonly({
      age:10
    })

    user.age = 11;

    expect(console.warn).toHaveBeenCalled ();
  })
});