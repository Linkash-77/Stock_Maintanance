import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import API from "../services/api";

import { Card, CardHead, CardTitle, CardBody } from "../components/Card";
import Button from "../components/Button";
import { Input, FormRow, FormLabel } from "../components/Input";
import { useToast } from "../components/Toast";
import PageContainer from "../components/PageContainer";

/* ─── Form Grid ─── */
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

/* ─── Styled Select ─── */
const Select = styled.select`
  height: 40px;
  border: 1px solid #ddd;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0 12px;
  font-size: 13px;
  width: 100%;
  background: #fff;
`;

/* ─── Table ─── */
const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  font-size: 11px;
  font-weight: 500;
  color: #8b909c;
  text-align: left;
  padding: 9px 14px;
  background: #f7f8fa;
  border-bottom: 1px solid #e4e6eb;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 11px 14px;
  border-bottom: 1px solid #e4e6eb;
`;

const ProductName = styled.span`
  font-weight: 500;
`;

const Status = styled.span`
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;

  ${({ $status }) =>
    $status === "out"
      ? `background:#fff5f5;color:#8b1a1a;`
      : `background:#e8f5ee;color:#1a6b3a;`}
`;

/* ─── Action buttons ─── */
const ActionButton = styled.button`
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.75; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const ResetButton = styled(ActionButton)`
  background: #fff8e6;
  color: #7a4f00;
  border-color: #f0d080;
  margin-right: 6px;
`;

const RemoveButton = styled(ActionButton)`
  background: #fff5f5;
  color: #8b1a1a;
  border-color: #f5c0c0;
`;

/* date/time in two lines */
const DateText = styled.div`
  font-size: 12px;
  color: #3d3d3a;
  font-weight: 500;
`;

const TimeText = styled.div`
  font-size: 11px;
  color: #8b909c;
  margin-top: 2px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 28px 0;
  color: #8b909c;
`;

/* ─── Helper ─── */
function formatDateTime(raw) {
  if (!raw) return { date: "—", time: "" };
  const d = new Date(raw);
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

/* ════════════════════════════════════════════════════════ */

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [name, setName] = useState("");
  const [waste, setWaste] = useState("");
  const [hasWaste, setHasWaste] = useState(true);
  const [unit, setUnit] = useState("kg");
  const [loadingId, setLoadingId] = useState(null);

  const { success, error } = useToast();

  const fetchInventory = useCallback(async () => {
    try {
      const res = await API.get("/inventory");
      setInventory(res.data);
    } catch {
      error("Failed to load inventory");
    }
  }, [error]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  /* ── Add product ── */
  const handleAdd = async () => {
    try {
      await API.post("/products", {
        name,
        unit,
        has_waste: hasWaste,
        defaultWastePercentage: hasWaste ? Number(waste || 0) : 0,
      });
      success("Product added");
      setName(""); setWaste(""); setHasWaste(true); setUnit("kg");
      fetchInventory();
    } catch {
      error("Failed to add product");
    }
  };

  /* ── Reset stock ── */
  const handleReset = async (productId) => {
    if (!window.confirm("Reset this product's stock to zero?")) return;
    setLoadingId(productId);
    try {
      await API.post(`/products/${productId}/reset-stock`);
      success("Stock reset to zero");
      fetchInventory();
    } catch {
      error("Failed to reset stock");
    } finally {
      setLoadingId(null);
    }
  };

  /* ── Remove product ── */
  const handleRemove = async (productId, productName) => {
    if (!window.confirm(`Remove "${productName}" from inventory? This cannot be undone.`)) return;
    setLoadingId(productId);
    try {
      await API.delete(`/products/${productId}`);
      success("Product removed");
      fetchInventory();
    } catch {
      error("Failed to remove product");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <PageContainer>

      {/* ── Current stock ── */}
      <Card>
        <CardHead>
          <CardTitle>Current stock</CardTitle>
        </CardHead>

        <CardBody style={{ padding: 0 }}>
          {inventory.length === 0 ? (
            <Empty>No products added yet</Empty>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Waste %</Th>
                    <Th>Stock</Th>
                    <Th>Status</Th>
                    <Th>Last Updated</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const { date, time } = formatDateTime(item.last_updated);
                    return (
                      <tr key={item.productId}>
                        <Td>
                          <ProductName>{item.name}</ProductName>
                        </Td>

                        <Td>
                          {item.has_waste ? `${item.waste}%` : "—"}
                        </Td>

                        <Td style={{ fontWeight: 500 }}>
                          {item.unit === "kg"
                            ? `${(item.stock ?? 0).toFixed(2)} kg`
                            : `${item.stock ?? 0} pcs`}
                        </Td>

                        <Td>
                          <Status $status={item.stock === 0 ? "out" : "ok"}>
                            {item.stock === 0 ? "Out of stock" : "In stock"}
                          </Status>
                        </Td>

                        <Td>
                          <DateText>{date}</DateText>
                          <TimeText>{time}</TimeText>
                        </Td>

                        <Td>
                          <ResetButton
                            onClick={() => handleReset(item.productId)}
                            disabled={loadingId === item.productId || item.stock === 0}
                            title="Reset stock to zero"
                          >
                            Reset stock
                          </ResetButton>
                          <RemoveButton
                            onClick={() => handleRemove(item.productId, item.name)}
                            disabled={loadingId === item.productId}
                            title="Remove product"
                          >
                            Remove
                          </RemoveButton>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </CardBody>
      </Card>

      {/* ── Add product ── */}
      <Card>
        <CardHead>
          <CardTitle>Add product</CardTitle>
        </CardHead>

        <CardBody>
          <FormGrid>
            <FormRow>
              <FormLabel>Product name</FormLabel>
              <Input
                placeholder="e.g. Chicken Breast"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormRow>

            <FormRow>
              <FormLabel>Unit</FormLabel>
              <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="kg">Kilograms (kg)</option>
                <option value="pcs">Pieces (pcs)</option>
              </Select>
            </FormRow>

            <FormRow>
              <FormLabel>Has waste?</FormLabel>
              <Select
                value={hasWaste ? "yes" : "no"}
                onChange={(e) => setHasWaste(e.target.value === "yes")}
              >
                <option value="yes">Yes</option>
                <option value="no">No (e.g. eggs)</option>
              </Select>
            </FormRow>

            {hasWaste && (
              <FormRow>
                <FormLabel>Default waste %</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  value={waste}
                  onChange={(e) => setWaste(e.target.value)}
                />
                <small style={{ fontSize: 11, color: "#8b909c" }}>
                  Leave empty if not applicable
                </small>
              </FormRow>
            )}
          </FormGrid>

          <Button
            style={{ marginTop: "14px", width: "100%", maxWidth: "220px" }}
            disabled={!name || (hasWaste && !waste)}
            onClick={handleAdd}
          >
            Add product
          </Button>
        </CardBody>
      </Card>

    </PageContainer>
  );
}

export default Inventory;