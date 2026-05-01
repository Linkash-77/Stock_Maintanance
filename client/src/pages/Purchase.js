import { useEffect, useState } from "react";
import styled from "styled-components";
import { Card, CardHead, CardTitle, CardBody } from "../components/Card";
import Button from "../components/Button";
import { Input, FormLabel } from "../components/Input";
import Select from "../components/Select";
import API from "../services/api";
import PageContainer from "../components/PageContainer";

/* ─── Usable weight strip ─── */
const CalcStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #e8f5ee;
  border: 1px solid #b7dfc8;
  border-radius: 6px;
  padding: 11px 14px;
`;

const CalcLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #1a6b3a;
`;

const CalcValue = styled.span`
  font-size: 17px;
  font-weight: 500;
  color: #0e4423;
`;

/* ─── Layout ─── */
const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const FieldWrap = styled.div`
  display: grid;
  gap: 12px;
`;

/* ─── Table ─── */
const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 420px;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  font-size: 11px;
  color: #8b909c;
  padding: 9px 14px;
  background: #f7f8fa;
  text-align: left;
  border-bottom: 1px solid #e4e6eb;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 11px 14px;
  border-bottom: 1px solid #e4e6eb;
`;

const TdRight = styled(Td)`
  text-align: right;
`;

/* date/time displayed in two lines */
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

/* ═══════════════════════════════════════════════════════ */

function Purchase() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [productId, setProductId] = useState("");
  const [rawWeight, setRawWeight] = useState("");
  const [waste, setWaste] = useState("");
  const [usable, setUsable] = useState(0);
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const unit = selectedProduct?.unit || "kg";
  const hasWaste = selectedProduct?.has_waste;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, purchasesRes] = await Promise.all([
        API.get("/products"),
        API.get("/purchase"),
      ]);
      setProducts(productsRes.data);
      // show newest first
      setHistory((purchasesRes.data || []).slice().reverse());
    } catch (err) {
      console.error(err);
    }
  };

  /* set default waste when product changes */
  useEffect(() => {
    if (!productId) return;
    if (unit === "pcs" || !hasWaste) {
      setWaste("");
    } else {
      setWaste(selectedProduct?.default_waste_percentage || "");
    }
  }, [productId, unit, hasWaste, selectedProduct]);

  /* recalculate usable weight */
  useEffect(() => {
    if (!rawWeight) { setUsable(0); return; }
    const raw = Number(rawWeight);
    if (unit === "pcs" || !hasWaste) { setUsable(raw); return; }
    const wasteValue = Number(waste || 0);
    setUsable((raw * (1 - wasteValue / 100)).toFixed(2));
  }, [rawWeight, waste, unit, hasWaste]);

  const handleSubmit = async () => {
    if (!productId || !rawWeight) { alert("Fill all fields"); return; }
    try {
      setLoading(true);
      await API.post("/purchase", {
        productId,
        rawWeight: Number(rawWeight),
        wastePercentage: unit === "kg" && hasWaste ? Number(waste || 0) : 0,
      });
      setProductId("");
      setRawWeight("");
      setWaste("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error adding purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>

      <Card>
        <CardHead><CardTitle>Add purchase</CardTitle></CardHead>
        <CardBody>
          <FieldWrap>

            <div>
              <FormLabel>Product</FormLabel>
              <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>

            <TwoCol>
              <div>
                <FormLabel>
                  Raw {unit === "kg" ? "weight (kg)" : "quantity (pcs)"}
                </FormLabel>
                <Input
                  type="number"
                  value={rawWeight}
                  onChange={(e) => setRawWeight(e.target.value)}
                  placeholder={unit === "kg" ? "0.00" : "Enter count"}
                />
              </div>

              {unit === "kg" && hasWaste && (
                <div>
                  <FormLabel>Waste %</FormLabel>
                  <Input
                    type="number"
                    value={waste}
                    onChange={(e) => setWaste(e.target.value)}
                    placeholder="%"
                  />
                </div>
              )}
            </TwoCol>

            {usable > 0 && (
              <CalcStrip>
                <CalcLabel>Usable</CalcLabel>
                <CalcValue>{usable} {unit}</CalcValue>
              </CalcStrip>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!productId || !rawWeight || loading}
            >
              {loading ? "Adding..." : "Add to inventory"}
            </Button>

          </FieldWrap>
        </CardBody>
      </Card>

      <Card>
        <CardHead><CardTitle>Purchase history</CardTitle></CardHead>
        <CardBody style={{ padding: 0 }}>
          {history.length === 0 ? (
            <Empty>No purchases yet</Empty>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>Date & Time</Th>
                    <Th>Product</Th>
                    <Th style={{ textAlign: "right" }}>Raw</Th>
                    <Th style={{ textAlign: "right" }}>Usable</Th>
                    <Th style={{ textAlign: "right" }}>Waste</Th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => {
                    const { date, time } = formatDateTime(p.created_at);
                    return (
                      <tr key={p.id}>
                        <Td>
                          <DateText>{date}</DateText>
                          <TimeText>{time}</TimeText>
                        </Td>
                        <Td>{p.product_name}</Td>
                        <TdRight>
                          {p.unit === "kg"
                            ? `${Number(p.raw_weight).toFixed(2)} kg`
                            : `${p.raw_weight} pcs`}
                        </TdRight>
                        <TdRight>
                          {p.unit === "kg"
                            ? `${Number(p.usable_weight).toFixed(2)} kg`
                            : `${p.usable_weight} pcs`}
                        </TdRight>
                        <TdRight>
                          {p.has_waste ? `${p.waste_percentage}%` : "—"}
                        </TdRight>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </CardBody>
      </Card>

    </PageContainer>
  );
}

export default Purchase;