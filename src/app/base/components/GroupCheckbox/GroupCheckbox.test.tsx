import { shallow } from "enzyme";

import GroupCheckbox from "./GroupCheckbox";

describe("GroupCheckbox", () => {
  it("renders", () => {
    const wrapper = shallow(
      <GroupCheckbox
        handleGroupCheckbox={jest.fn()}
        items={[]}
        selectedItems={[]}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("shows as mixed when some items are checked", () => {
    const wrapper = shallow(
      <GroupCheckbox
        handleGroupCheckbox={jest.fn()}
        items={[1, 2, 3]}
        selectedItems={[2]}
      />
    );
    expect(wrapper.prop("checked")).toBe(true);
    expect(wrapper.prop("aria-checked")).toBe("mixed");
  });

  it("can show a label", () => {
    const wrapper = shallow(
      <GroupCheckbox
        handleGroupCheckbox={jest.fn()}
        inputLabel="Check all"
        items={[]}
        selectedItems={[]}
      />
    );
    expect(wrapper.prop("label")).toBe("Check all");
  });

  it("can be disabled even if items exist", () => {
    const wrapper = shallow(
      <GroupCheckbox
        disabled
        handleGroupCheckbox={jest.fn()}
        inputLabel="Check all"
        items={[1, 2, 3]}
        selectedItems={[2]}
      />
    );
    expect(wrapper.prop("disabled")).toBe(true);
  });

  it("can check if it should be selected via a function", () => {
    const wrapper = shallow(
      <GroupCheckbox
        checkSelected={() => true}
        handleGroupCheckbox={jest.fn()}
        items={[]}
        selectedItems={[]}
      />
    );
    expect(wrapper.prop("checked")).toBe(true);
  });

  it("can check if it should display as mixed via a function", () => {
    const wrapper = shallow(
      <GroupCheckbox
        checkAllSelected={() => false}
        handleGroupCheckbox={jest.fn()}
        items={[1, 2, 3]}
        selectedItems={[2]}
      />
    );
    expect(wrapper.prop("checked")).toBe(true);
    expect(wrapper.prop("aria-checked")).toBe("mixed");
  });
});