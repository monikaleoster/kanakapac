export const metadata = {
  title: "About - Kanaka PAC",
  description:
    "Learn about the Kanaka Parent Advisory Council, our mission, and our executive team.",
};

export default function AboutPage() {
  const executive = [
    {
      role: "Chairperson",
      name: "Sarah Thompson",
      bio: "Parent of two Kanaka students. Serving her second year as Chair.",
    },
    {
      role: "Vice-Chairperson",
      name: "Michael Chen",
      bio: "New to the executive this year. Active volunteer for school events.",
    },
    {
      role: "Treasurer",
      name: "Priya Patel",
      bio: "CPA by profession. Managing PAC finances for the third year.",
    },
    {
      role: "Secretary",
      name: "Jane Doe",
      bio: "Responsible for meeting minutes and PAC correspondence.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        About Kanaka PAC
      </h1>
      <p className="text-gray-600 mb-8">
        Learn about who we are and what we do for the school community.
      </p>

      {/* Mission */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          The Kanaka Parent Advisory Council exists to support and enhance the
          educational experience for all students at Kanaka Elementary. We
          serve as a bridge between families and the school, ensuring that
          parent voices are heard in decisions that affect our children&apos;s
          education. Through community building, fundraising, and advocacy, we
          work to create the best possible learning environment.
        </p>
      </section>

      {/* What We Do */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Fundraising
            </h3>
            <p className="text-gray-700 text-sm">
              We organize events and campaigns to raise funds for classroom
              resources, playground improvements, field trips, and school
              programs that benefit all students.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Advocacy</h3>
            <p className="text-gray-700 text-sm">
              We represent parent interests at the school and district level,
              providing input on policies, curriculum, and resource allocation.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Community Building
            </h3>
            <p className="text-gray-700 text-sm">
              We host social events throughout the year to bring families
              together and build a strong, connected school community.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Volunteer Coordination
            </h3>
            <p className="text-gray-700 text-sm">
              We coordinate parent volunteers for school events, classroom
              support, hot lunch programs, and other school initiatives.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Team */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Executive Team (2025-2026)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {executive.map((member) => (
            <div
              key={member.role}
              className="border border-gray-100 rounded-lg p-4"
            >
              <p className="text-sm text-primary-600 font-medium">
                {member.role}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {member.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Get Involved */}
      <section className="bg-primary-50 rounded-lg p-8 border border-primary-100">
        <h2 className="text-xl font-bold text-primary-900 mb-4">
          How to Get Involved
        </h2>
        <p className="text-primary-800 mb-4">
          Every parent and guardian of a Kanaka student is automatically a
          member of the PAC. Here are some ways to participate:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-primary-800">
          <li>Attend monthly PAC meetings (first Wednesday of each month)</li>
          <li>Volunteer at school events and fundraisers</li>
          <li>Join a PAC committee (Fundraising, Social, Safety)</li>
          <li>Run for an executive position at the September AGM</li>
          <li>Share your ideas and feedback at meetings or via email</li>
        </ul>
      </section>
    </div>
  );
}
