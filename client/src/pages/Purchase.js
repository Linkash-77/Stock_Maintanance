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
  min-width: 320px;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  font-size: 11px;
  color: #8b909c;
  padding: 9px 14px;
  background: #f7f8fa;
`;

const Td = styled.td`
  padding: 11px 14px;
  border-bottom: 1px solid #e4e6eb;
`;

const TdRight = styled(Td)`
  text-align: right;
`;

const Empty = styled.div`
  text-align: center;
  padding: 28px 0;
  color: #8b909c;
`;

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
      setHistory(purchasesRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* 🔥 SET DEFAULT WASTE */
  useEffect(() => {
    if (!productId) return;

    if (unit === "pcs" || !hasWaste) {
      setWaste("");
    } else {
      setWaste(selectedProduct?.default_waste_percentage || "");
    }
  }, [productId, unit, hasWaste, selectedProduct]);

  /* 🔥 FIXED CALCULATION */
  useEffect(() => {
    if (!rawWeight) {
      setUsable(0);
      return;
    }

    const raw = Number(rawWeight);

    // PCS → no waste
    if (unit === "pcs") {
      setUsable(raw);
      return;
    }

    // KG but no waste
    if (!hasWaste) {
      setUsable(raw);
      return;
    }

    // KG + waste
    const wasteValue = Number(waste || 0);
    const result = raw * (1 - wasteValue / 100);

    setUsable(result.toFixed(2));

  }, [rawWeight, waste, unit, hasWaste]);

  const handleSubmit = async () => {
    if (!productId || !rawWeight) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/purchase", {
        productId,
        rawWeight: Number(rawWeight),
        wastePercentage:
          unit === "kg" && hasWaste
            ? Number(waste || 0)
            : 0,
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

              {/* 🔥 HIDE FOR PCS */}
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
                    <Th>Product</Th>
                    <Th>Raw</Th>
                    <Th>Usable</Th>
                    <Th>Waste</Th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => (
                    <tr key={p.id}>
                      <Td>{p.product_name}</Td>
                      <TdRight>{p.raw_weight}</TdRight>
                      <TdRight>{p.usable_weight}</TdRight>
                      <TdRight>{p.waste_percentage}%</TdRight>
                    </tr>
                  ))}
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