import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  XCircle, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Smartphone
} from "lucide-react";

export const ProblemSolutionSection = () => {
  const problems = [
    {
      icon: TrendingDown,
      title: "Clientes no te encuentran online",
      description: "Sin presencia web, pierdes clientes que buscan restaurantes en Google.",
      color: "text-destructive"
    },
    {
      icon: Clock,
      title: "Pedidos solo por teléfono",
      description: "Atender llamadas interrumpe el servicio y genera confusión en pedidos.",
      color: "text-destructive"
    },
    {
      icon: DollarSign,
      title: "Dependes 100% del delivery",
      description: "Apps como Rappi se llevan hasta 30% de comisión por cada pedido.",
      color: "text-destructive"
    },
    {
      icon: Users,
      title: "Sin información clara",
      description: "Clientes no saben tu horario, ubicación exacta o especialidades.",
      color: "text-destructive"
    }
  ];

  const solutions = [
    {
      icon: CheckCircle,
      title: "Te encuentran fácilmente",
      description: "SEO optimizado para aparecer en 'restaurantes cerca de mí' en Google.",
      color: "text-primary"
    },
    {
      icon: Smartphone,
      title: "Pedidos directos por WhatsApp",
      description: "Botón directo a WhatsApp con menú descargable, sin intermediarios.",
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      title: "Reduces comisiones",
      description: "Clientes directos = mayor margen de ganancia en cada pedido.",
      color: "text-primary"
    },
    {
      icon: CheckCircle,
      title: "Información completa 24/7",
      description: "Horarios, ubicación, menú y contacto disponibles siempre.",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
            La Realidad del Mercado
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            ¿Tu restaurante está perdiendo
            <span className="text-destructive block">Clientes cada día?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            En 2024, el 87% de los clientes buscan restaurantes online antes de decidir. 
            Si no te encuentran, van con la competencia.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          {/* Problems Side */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full border border-destructive/20 mb-6">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Problemas Actuales</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Sin presencia online profesional
              </h3>
              <p className="text-muted-foreground mb-8">
                Estos son los problemas más comunes que enfrentan los restaurantes sin sitio web:
              </p>
            </div>

            <div className="space-y-4">
              {problems.map((problem, index) => {
                const Icon = problem.icon;
                return (
                  <Card key={index} className="border-destructive/20 hover:border-destructive/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center ${problem.color} flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            {problem.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {problem.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Impact Stats */}
            <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-xl">
              <h4 className="font-semibold text-destructive mb-4">Impacto en tu negocio:</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-destructive">-40%</div>
                  <div className="text-xs text-muted-foreground">Clientes potenciales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">30%</div>
                  <div className="text-xs text-muted-foreground">Comisión delivery</div>
                </div>
              </div>
            </div>
          </div>

          {/* Solutions Side */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 mb-6">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Nuestra Solución</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Con Mi Restaurante Online
              </h3>
              <p className="text-muted-foreground mb-8">
                Transformamos estos problemas en oportunidades de crecimiento para tu negocio:
              </p>
            </div>

            <div className="space-y-4">
              {solutions.map((solution, index) => {
                const Icon = solution.icon;
                return (
                  <Card key={index} className="border-primary/20 hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${solution.color} flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            {solution.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {solution.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Results Stats */}
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
              <h4 className="font-semibold text-primary mb-4">Resultados esperados:</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">+60%</div>
                  <div className="text-xs text-muted-foreground">Clientes directos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">S/0</div>
                  <div className="text-xs text-muted-foreground">Comisiones</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-card border border-accent/20 p-8 rounded-2xl shadow-accent max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              ¿Listo para transformar tu negocio?
            </h3>
            <p className="text-muted-foreground mb-6">
              No dejes que tus competidores se adelanten. Tu sitio web profesional 
              puede estar listo en 72 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary"
                onClick={() => document.getElementById('application')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Comenzar Ahora
              </Button>
              <Button 
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5"
                onClick={() => window.open("https://wa.me/51999999999?text=Hola, quiero saber más sobre cómo Mi Restaurante Online puede ayudar a mi negocio", "_blank")}
              >
                Conversemos por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};