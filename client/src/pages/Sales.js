import { useEffect, useState } from "react";
import styled from "styled-components";
import { Card, CardHead, CardTitle, CardBody } from "../components/Card";
import Button from "../components/Button";
import { Input, FormLabel } from "../components/Input";
import Select from "../components/Select";
import API from "../services/api";
import { useToast } from "../components/Toast";
import PageContainer from "../components/PageContainer";


/* UI */
const StockPill = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 11px 14px;
  border-radius: 6px;
  border: 1px solid ${({ $low }) => ($low ? "#f5c842" : "#b7dfc8")};
  background: ${({ $low }) => ($low ? "#fffbf0" : "#e8f5ee")};
`;

const StockPillLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

const StockPillValue = styled.span`
  font-size: 17px;
  font-weight: 500;
`;

const WarnStrip = styled.div`
  background: #fffbf0;
  border: 1px solid #f5c842;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 500;
`;

const FieldWrap = styled.div`
  display: grid;
  gap: 12px;
`;

const Table = styled.table`
  width: 100%;
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
  font-weight: 500;
`;

const ProductName = styled.span`
  font-weight: 500;
`;

const Empty = styled.div`
  text-align: center;
  padding: 28px 0;
  color: #8b909c;
`;

/* MAIN */
function Sales() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const { success } = useToast();


  /* ✅ FIX 1: UUID SAFE MATCH */
  const selectedProduct = products.find(
    (p) => p.id === productId
  );

  const unit = selectedProduct?.unit;

  /* FETCH */
  const fetchData = async () => {
    try {
      const [productsRes, salesRes] = await Promise.all([
        API.get("/products"),
        API.get("/sales"),
      ]);

      setProducts(productsRes.data || []);
      setHistory(salesRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (productId) fetchStock(productId);
  }, [productId]);

  const fetchStock = async (id) => {
    try {
      const res = await API.get(`/sales/stock/${id}`);
      setStock(res.data.stock || 0);
    } catch (err) {
      console.error(err);
    }
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!productId || !qty) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      /* ✅ FIX 2: STORE UNIT BEFORE RESET */
      const currentUnit = selectedProduct?.unit;

      const res = await API.post("/sales", {
        productId,
        soldWeight: Number(qty),
      });

      success(`Stock updated • Remaining: ${res.data.remainingStock} ${currentUnit}`);
      /* RESET AFTER */
      setQty("");
      setProductId("");
      setStock(0);

      fetchData();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Sale failed");
    } finally {
      setLoading(false);
    }
  };

  const isOverStock = Number(qty) > stock;

  return (
    <PageContainer>
    <div>

      {/* FORM */}
      <Card>
        <CardHead>
          <CardTitle>Record sale</CardTitle>
        </CardHead>

        <CardBody>
          <FieldWrap>

            {/* PRODUCT */}
            <div>
              <FormLabel>Product</FormLabel>
              <Select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">— select product —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>

            {/* STOCK */}
            {productId && unit && (
              <StockPill $low={stock < 1}>
                <StockPillLabel>Available stock</StockPillLabel>
                <StockPillValue>
                  {unit === "kg"
                    ? `${stock.toFixed(2)} kg`
                    : `${stock} pcs`}
                </StockPillValue>
              </StockPill>
            )}

            {/* QUANTITY */}
            <div>
              <FormLabel>
                Quantity to sell ({unit || "--"})
              </FormLabel>

              <Input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder={
                  unit === "kg"
                    ? "0.00"
                    : unit === "pcs"
                    ? "Enter count"
                    : ""
                }
              />
            </div>

            {/* WARNING */}
            {isOverStock && qty > 0 && unit && (
              <WarnStrip>
                Only {unit === "kg" ? stock.toFixed(2) : stock} {unit} available
              </WarnStrip>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!qty || isOverStock || loading}
            >
              {loading ? "Recording…" : "Record sale"}
            </Button>

          </FieldWrap>
        </CardBody>
      </Card>

      {/* HISTORY */}
      <Card>
        <CardHead>
          <CardTitle>Sales history</CardTitle>
        </CardHead>

        <CardBody style={{ padding: 0 }}>
          {history.length === 0 ? (
            <Empty>No sales yet</Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th style={{ textAlign: "right" }}>Qty</Th>
                </tr>
              </thead>

              <tbody>
                {history.map((s) => (
                  <tr key={s.id}>
                    <Td>
                      <ProductName>{s.product_name}</ProductName>
                    </Td>

                    <TdRight>
                      {s.unit === "kg"
                        ? `${(s.sold_weight ?? 0).toFixed(2)} kg`
                        : `${s.sold_weight ?? 0} pcs`}
                    </TdRight>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

    </div>
    </PageContainer>
  );
}

export default Sales;