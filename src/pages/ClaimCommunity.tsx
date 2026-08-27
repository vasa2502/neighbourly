import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Shield, CheckCircle, ArrowRight, ArrowLeft, Upload } from "lucide-react";

type Step = "search" | "verify" | "submit" | "success";

export default function ClaimCommunity() {
  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [formData, setFormData] = useState({
    organizationName: "",
    role: "",
    email: "",
    phone: "",
    verificationDocument: "",
    message: "",
  });

  const mockCommunities = [
    { id: "1", name: "Green Valley Residency", area: "Koramangala", city: "Bangalore", type: "Apartment", residents: 342 },
    { id: "2", name: "Sunrise Heights", area: "Indiranagar", city: "Bangalore", type: "Apartment", residents: 189 },
  ];

  const filteredCommunities = mockCommunities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[hsl(40,20%,98%)]">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-[hsl(155,45%,32%)] hover:text-[hsl(155,50%,28%)]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(155,45%,32%)] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[hsl(155,35%,18%)]">Claim Your Community</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(["search", "verify", "submit", "success"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? "bg-[hsl(155,45%,32%)] text-white" :
                (["search", "verify", "submit", "success"].indexOf(step) > i ? "bg-[hsl(155,35%,85%)] text-[hsl(155,45%,32%)]" : "bg-gray-100 text-gray-400")
              }`}>
                {(["search", "verify", "submit", "success"].indexOf(step) > i ? <CheckCircle className="w-4 h-4" /> : i + 1)}
              </div>
              {i < 3 && <div className={`w-8 h-0.5 ${["search", "verify", "submit", "success"].indexOf(step) > i ? "bg-[hsl(155,35%,85%)]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Search Step */}
        {step === "search" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(155,35%,18%)] mb-2">Find Your Community on JOINN</h1>
              <p className="text-[hsl(155,10%,45%)]">Search for the community you represent to begin the claiming process.</p>
            </div>

            <div className="relative">
              <Input
                placeholder="Search by community name or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 h-12 text-base"
              />
            </div>

            {searchQuery && (
              <div className="space-y-3">
                {filteredCommunities.map((community) => (
                  <Card
                    key={community.id}
                    className="cursor-pointer hover:border-[hsl(155,45%,32%)] transition-colors"
                    onClick={() => setStep("verify")}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[hsl(155,45%,95%)] flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-[hsl(155,45%,32%)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[hsl(155,35%,18%)]">{community.name}</p>
                          <p className="text-sm text-[hsl(155,10%,45%)]">{community.area}, {community.city} · {community.type} · ~{community.residents} residents</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-dashed border-2 border-gray-200 hover:border-[hsl(155,45%,32%)] cursor-pointer transition-colors" onClick={() => setStep("verify")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                      <span className="text-xl">🔍</span>
                    </div>
                    <div>
                      <p className="font-medium text-[hsl(155,35%,18%)]">My community is not listed</p>
                      <p className="text-sm text-[hsl(155,10%,45%)]">You can still claim it — we'll verify the information</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Verify Step */}
        {step === "verify" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(155,35%,18%)] mb-2">Verify Your Authority</h1>
              <p className="text-[hsl(155,10%,45%)]">To become the official Community Admin, we need to verify your relationship with this community.</p>
            </div>

            <Card className="bg-[hsl(155,45%,97%)] border-[hsl(155,35%,85%)]">
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-[hsl(155,45%,32%)] mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-[hsl(155,35%,18%)]">Why is verification required?</p>
                  <p className="text-[hsl(155,10%,45%)] mt-1">JOINN requires community administrators to verify their authority to prevent unauthorized claims and protect resident privacy. This process ensures that only legitimate representatives gain administrative control.</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Organization or Entity Name</Label>
                <Input
                  placeholder="e.g., Green Valley Residents Welfare Association"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Your Role / Title</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="president">President / Chairperson</SelectItem>
                    <SelectItem value="secretary">Secretary</SelectItem>
                    <SelectItem value="treasurer">Treasurer</SelectItem>
                    <SelectItem value="board-member">Board Member</SelectItem>
                    <SelectItem value="manager">Community Manager</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Verification Document</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[hsl(155,45%,32%)] cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-[hsl(155,10%,45%)]">Upload official document (RWA registration, society bylaws, HOA certificate, etc.)</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG — Max 5MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Message (Optional)</Label>
                <Textarea
                  placeholder="Any additional context about your role or relationship with the community..."
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
            </div>

            <Button className="w-full h-12 bg-[hsl(155,45%,32%)] hover:bg-[hsl(155,50%,28%)] text-white" onClick={() => setStep("submit")}>
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Submit Step */}
        {step === "submit" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(155,35%,18%)] mb-2">Review Your Claim Request</h1>
              <p className="text-[hsl(155,10%,45%)]">Please review the information below before submitting.</p>
            </div>

            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-[hsl(155,10%,45%)]">Community</span>
                  <span className="font-medium text-[hsl(155,35%,18%)]">Green Valley Residency</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(155,10%,45%)]">Organization</span>
                  <span className="font-medium text-[hsl(155,35%,18%)]">{formData.organizationName || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(155,10%,45%)]">Your Role</span>
                  <span className="font-medium text-[hsl(155,35%,18%)]">{formData.role || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(155,10%,45%)]">Verification Document</span>
                  <span className="font-medium text-green-600">Uploaded ✓</span>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full h-12 bg-[hsl(155,45%,32%)] hover:bg-[hsl(155,50%,28%)] text-white" onClick={async () => {
              if (!selectedCommunity) { toast.error("Select a community first"); return; }
              try {
                const { submitClaim } = await import("@/lib/api");
                const { supabase } = await import("@/integrations/supabase/client");
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { toast.error("Please sign in"); return; }
                await submitClaim(user.id, selectedCommunity.id, {
                  organizationName: formData.organizationName,
                  roleTitle: formData.role,
                  evidence: formData.message || formData.email,
                });
                toast.success("Claim request submitted!");
              } catch (err: any) {
                toast.error(err?.message || "Failed to submit claim");
              }
              setStep("success");
            }}>
              Submit Claim Request
            </Button>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 rounded-3xl bg-[hsl(155,45%,95%)] flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-[hsl(155,45%,32%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(155,35%,18%)] mb-2">Claim Request Submitted</h1>
              <p className="text-[hsl(155,10%,45%)] max-w-md mx-auto">
                Your claim request has been submitted for review. Our team will verify your authority and get back to you within 2-3 business days.
              </p>
            </div>

            <Card className="bg-[hsl(155,45%,97%)] border-[hsl(155,35%,85%)] max-w-md mx-auto">
              <CardContent className="p-4 text-sm space-y-2">
                <p className="font-medium text-[hsl(155,35%,18%)]">What happens next?</p>
                <ul className="text-[hsl(155,10%,45%)] space-y-1 text-left">
                  <li>• Our team reviews your claim (2-3 business days)</li>
                  <li>• We may contact you for additional verification</li>
                  <li>• Once approved, you'll receive Community Admin access</li>
                  <li>• You'll be notified via email</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-center">
              <Link to="/">
                <Button variant="outline" className="border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)]">
                  Return Home
                </Button>
              </Link>
              <Link to="/find-community">
                <Button className="bg-[hsl(155,45%,32%)] hover:bg-[hsl(155,50%,28%)] text-white">
                  Join as Resident
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
