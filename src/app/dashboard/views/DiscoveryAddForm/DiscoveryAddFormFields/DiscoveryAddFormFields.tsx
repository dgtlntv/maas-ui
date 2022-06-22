import { Col, Row, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom-v5-compat";

import type { DiscoveryAddValues } from "../types";
import { DeviceType } from "../types";

import FormikField from "app/base/components/FormikField";
import IpAssignmentSelect from "app/base/components/IpAssignmentSelect";
import TooltipButton from "app/base/components/TooltipButton";
import deviceSelectors from "app/store/device/selectors";
import type { Device } from "app/store/device/types";
import { DeviceMeta } from "app/store/device/types";
import type { Discovery } from "app/store/discovery/types";
import domainSelectors from "app/store/domain/selectors";
import machineSelectors from "app/store/machine/selectors";
import type { RootState } from "app/store/root/types";
import subnetSelectors from "app/store/subnet/selectors";
import { getSubnetDisplay } from "app/store/subnet/utils";
import { NodeStatusCode } from "app/store/types/node";
import vlanSelectors from "app/store/vlan/selectors";
import { getVLANDisplay } from "app/store/vlan/utils";
import subnetsURLs from "app/subnets/urls";

type Props = {
  discovery: Discovery;
  setDevice: (device: Device[DeviceMeta.PK] | null) => void;
  setDeviceType: (deviceType: DeviceType) => void;
};

const DiscoveryAddFormFields = ({
  discovery,
  setDevice,
  setDeviceType,
}: Props): JSX.Element | null => {
  const devices = useSelector(deviceSelectors.all);
  const domains = useSelector(domainSelectors.all);
  const machines = useSelector((state: RootState) =>
    machineSelectors.getByStatusCode(state, NodeStatusCode.DEPLOYED)
  );
  const subnet = useSelector((state: RootState) =>
    subnetSelectors.getByCIDR(state, discovery.subnet_cidr)
  );
  const vlan = useSelector((state: RootState) =>
    vlanSelectors.getById(state, discovery.vlan)
  );
  const { setFieldValue, values } = useFormikContext<DiscoveryAddValues>();
  const isDevice = values.type === DeviceType.DEVICE;
  const isInterface = values.type === DeviceType.INTERFACE;
  // Only include static when the discovery has a subnet.
  const includeStatic = !!discovery.subnet || discovery.subnet === 0;
  const subnetDisplay = getSubnetDisplay(subnet);
  const vlanDisplay = getVLANDisplay(vlan);

  return (
    <>
      <Row>
        <Col size={6}>
          <FormikField
            component={Select}
            label="Type"
            name="type"
            onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
              setFieldValue("type", evt.target.value);
              setDeviceType(evt.target.value as DeviceType);
              // Clear the device in case it has been set previously.
              setDevice(null);
            }}
            options={[
              { label: "Choose type", value: "", disabled: true },
              { label: "Device", value: DeviceType.DEVICE },
              { label: "Interface", value: DeviceType.INTERFACE },
            ]}
            required
          />
          <FormikField
            label={`${isDevice ? "Hostname" : "Interface name"} (optional)`}
            name="hostname"
            type="text"
          />
          {isDevice ? (
            <FormikField
              component={Select}
              label="Domain"
              name="domain"
              options={[
                { label: "Choose domain", value: "", disabled: true },
                ...domains.map((domain) => ({
                  label: domain.name,
                  value: domain.name,
                })),
              ]}
              required
            />
          ) : null}
          {isInterface ? (
            <FormikField
              component={Select}
              label={
                <>
                  Device name{" "}
                  <TooltipButton message="Create as an interface on the selected device." />
                </>
              }
              name={DeviceMeta.PK}
              onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                setFieldValue(DeviceMeta.PK, evt.target.value);
                setDevice(evt.target.value as Device[DeviceMeta.PK]);
              }}
              options={[
                { label: "Select device name", value: "", disabled: true },
                ...devices.map((device) => ({
                  label: device.fqdn,
                  value: device[DeviceMeta.PK],
                })),
              ]}
              required
            />
          ) : (
            <FormikField
              component={Select}
              label={
                <>
                  Parent{" "}
                  <TooltipButton message="Assign this device as a child of the parent machine." />
                </>
              }
              name="parent"
              options={[
                { label: "Select parent (optional)", value: "" },
                ...machines.map((machine) => ({
                  label: machine.fqdn,
                  value: machine.system_id,
                })),
              ]}
            />
          )}
        </Col>
        <Col size={6}>
          <IpAssignmentSelect
            includeStatic={includeStatic}
            name="ip_assignment"
            required
          />
          <div className="">
            <p>Fabric</p>
            <p>
              <Link to={subnetsURLs.fabric.index({ id: discovery.fabric })}>
                {discovery.fabric_name}
              </Link>
            </p>
          </div>
          <div className="u-nudge-down--small">
            <p>VLAN</p>
            <p>
              {vlanDisplay ? (
                <Link to={subnetsURLs.vlan.index({ id: discovery.vlan })}>
                  {vlanDisplay}
                </Link>
              ) : null}
            </p>
          </div>
          <div className="u-nudge-down--small">
            <p>Subnet</p>
            {discovery.subnet && subnetDisplay ? (
              <p>
                <Link to={subnetsURLs.subnet.index({ id: discovery.subnet })}>
                  {subnetDisplay}
                </Link>
              </p>
            ) : null}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default DiscoveryAddFormFields;