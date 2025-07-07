import { isReadonly, readonly, isProxy } from "../reactive";
describe("readonly",() => {
  it("happy path",() => {

    //not set
    const original = {foo:1,bar:{ baz:2 }};
    const warpped = readonly(original);
    expect(warpped).not.toBe(original);
    expect(isReadonly(warpped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(warpped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
    expect(isProxy(warpped)).toBe(true);
    expect(warpped.foo).toBe(1);
  });

  it('warn then call set',() => {
    //console.warn()
    //mock
    console.warn = jest.fn();

    const user = readonly({
      age:10
    })

    user.age = 11;

    expect(console.warn).toHaveBeenCalled ();
  })
})